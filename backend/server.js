import express from "express";
import cors from "cors";
import axios from "axios";
import { supabase } from "./utils/supabaseClient.js";
import matchClosestUsers from "./utils/userMatching.js";
import calculateDistance from "./utils/distanceCalc.js";
import internalOps from "./routes/internalOps.js";
import signUp from "./routes/signUp.js";
import login from "./routes/login.js";
import messaging from "./routes/messaging.js";
import updateInfo from "./routes/updateInfo.js";
import getInfo from "./routes/getInfo.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(internalOps);
app.use(login);
app.use(signUp);
app.use(messaging);
app.use(updateInfo);
app.use(getInfo);

app.post("/next-user-data", async (req, res) => {
  let nextUserUuid = "";
  let nextUserNum = "";
  let userId = "";
  let outofuserstate = 0;
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;

    userId = user.id;
    const { data: userData, error: dataError } = await supabase
      .from("nextusers")
      .select("*")
      .eq("uuid", user.id)
      .single();

    if (userData) {
      const nextUserField = `user${userData.nextuser}`;

      const nextUserId = userData[nextUserField];

      nextUserNum = userData.nextuser;

      nextUserUuid = nextUserId;
    } else {
      return res.status(404).json({ oou: 1 });
    }
  } catch (error) {
    console.error("Processing error:", error.message);
    return res.status(404).json({ oou: 1 });
  }

  let userDataTable = null;

  try {
    const { data, error } = await supabase
      .from("userdata")
      .select("*")
      .eq("uuid", nextUserUuid)
      .single();

    if (error) {
      throw new Error(`Error fetching user data: ${error.message}`);
    }

    if (!data) {
      throw new Error("No user data found for the specified UUID.");
    }

    userDataTable = data;
  } catch (error) {
    console.error("Error retrieving user data:", error.message);
    return res.status(404).json({ oou: 1 });
  }

  const { data: pictureLinks, error: dataError } = await supabase
    .from("images")
    .select("picture1, picture2, picture3, picture4, picture5")
    .eq("uuid", nextUserUuid)
    .single();

  const { data: basicInfo } = await supabase
    .from("users")
    .select("*")
    .eq("uuid", nextUserUuid)
    .single();

  if (nextUserNum > 5 || nextUserNum === null) {
    console.log("Over 5, reloading users now");
    try {
      outofuserstate = await matchClosestUsers(userId);
      console.log(outofuserstate);
    } catch (error) {
      outofuserstate = 1;
      console.error("Failed to match closest users:", error);
    }
  }

  let currentUserData = null;

  try {
    const { data, error } = await supabase
      .from("userdata")
      .select("*")
      .eq("uuid", userId)
      .single();

    if (error) {
      throw new Error(`Error fetching current user data: ${error.message}`);
    }

    if (!data) {
      throw new Error("No current user data found.");
    }

    currentUserData = data;
  } catch (error) {
    console.error("Error retrieving current user data:", error.message);
    return res.status(404).json({ oou: 1 });
  }

  let CurrentLatitude = currentUserData.latitude; // this is the data thats of the current user
  let CurrentLongitude = currentUserData.longitude;
  let NextLatitude = userDataTable.latitude; // this is the data thats shown on the card
  let NextLongitude = userDataTable.longitude;

  const distance = calculateDistance(
    CurrentLatitude,
    CurrentLongitude,
    NextLatitude,
    NextLongitude
  );
  console.log(distance);
  return res.status(200).json({
    userUUID: nextUserUuid,
    userdata: userDataTable,
    pictures: pictureLinks,
    basic: basicInfo,
    distance: distance,
    oou: outofuserstate, //out of users
  });
});

app.post("/mark-user-seen", async (req, res) => {
  const { accessToken, relation } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  if (relation === undefined) {
    return res.status(400).json({ error: "relation content is required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;

    const { data: nextusers, error: basicInfoError } = await supabase
      .from("nextusers")
      .select("*")
      .eq("uuid", user.id)
      .single();

    const idofNextUser = nextusers.nextuser;
    const nextUserField = `user${idofNextUser}`;
    const currentUserID = nextusers[nextUserField]; //this is the current uuid of the profile that should be currently shown.

    if (relation == "like") {
      const { data: insertData, error: insertUserDataError } = await supabase
        .from("relation")
        .insert([
          {
            user_from: user.id,
            user_to: currentUserID,
            type: 1, // type 1 is like, type 2 is pass, type 3 is block.
          },
        ]);

      if (insertUserDataError) {
        throw insertUserDataError;
      }
    } else if (relation == "dislike") {
      console.log("dislike");
      const { data: insertData, error: insertUserDataError } = await supabase
        .from("relation")
        .insert([
          {
            user_from: user.id,
            user_to: currentUserID,
            type: 2, // type 1 is like, type 2 is pass, type 3 is block.
          },
        ]);

      if (insertUserDataError) {
        throw insertUserDataError;
      }
    } else if (relation == "block") {
      console.log("block");
      const { data: insertData, error: insertUserDataError } = await supabase
        .from("relation")
        .insert([
          {
            user_from: user.id,
            user_to: currentUserID,
            type: 3, // type 1 is like, type 2 is pass, type 3 is block.
          },
        ]);

      if (insertUserDataError) {
        throw insertUserDataError;
      }
    } else {
      console.log("Unknown relation type.");
    }

    const { error: updateError } = await supabase
      .from("nextusers")
      .update({
        nextuser: nextusers.nextuser + 1,
      })
      .eq("uuid", user.id);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({ idofNextUser });
  } catch (error) {
    console.error("Error updating bio:", error.message);
    return res.status(500).json({ error: error.message });
  }
});



app.post("/user-profile", async (req, res) => {
  const { userId, accessToken } = req.body;

  if (!userId || !accessToken) {
    return res
      .status(400)
      .json({ error: "User ID and access token are required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;

    const { data: userBasicInfo, error: basicInfoError } = await supabase
      .from("users")
      .select("*")
      .eq("uuid", userId)
      .single();

    if (basicInfoError) throw basicInfoError;

    const { data: userData, error: dataError } = await supabase
      .from("userdata")
      .select("*")
      .eq("uuid", userId)
      .single();

    if (dataError) throw dataError;

    const { data: userImages, error: imagesError } = await supabase
      .from("images")
      .select("*")
      .eq("uuid", userId)
      .single();

    if (imagesError) throw imagesError;

    return res.status(200).json({
      basic: userBasicInfo,
      userdata: userData,
      pictures: userImages,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
