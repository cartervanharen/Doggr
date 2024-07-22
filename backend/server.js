import express from "express";
import cors from "cors";
import axios from "axios";
import { supabase } from "./utils/supabaseClient.js";
import matchClosestUsers from "./utils/userMatching.js";
import calculateDistance from "./utils/distanceCalc.js";
import internalOps from "./routes/internalOps.js";
import signUp from "./routes/signUp.js";
import login from "./routes/login.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(internalOps);
app.use(login);
app.use(signUp);

app.post("/get-user-info", async (req, res) => {
  const token = req.body.accessToken;

  if (!token) {
    return res.status(403).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(token);

    if (error) {
      throw error;
    }

    const { data: userData, fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("uuid", user.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/update-user-info", async (req, res) => {
  const { accessToken, firstName, lastName, dogName, address, email } =
    req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);

    if (error) {
      throw error;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        human_first_name: firstName,
        human_last_name: lastName,
        dog_name: dogName,
        address: address,
        email: email,
      })
      .eq("uuid", user.id);

    if (updateError) {
      console.error("Update Error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res
      .status(200)
      .json({ message: "User information updated successfully" });
  } catch (error) {
    console.error("Error updating user information:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/update-dog-traits", async (req, res) => {
  const {
    accessToken,
    likeability,
    energy,
    playfulness,
    aggression,
    size,
    training,
  } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);
    if (error) throw error;

    const { error: updateError } = await supabase
      .from("userdata")
      .update({
        likeability,
        energy,
        playfulness,
        aggression,
        size,
        training,
      })
      .eq("uuid", user.id);

    if (updateError) {
      console.error("Update Error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ message: "Dog traits updated successfully" });
  } catch (error) {
    console.error("Error updating dog traits:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/update-dog-filter", async (req, res) => {
  const {
    accessToken,
    likeabilityFilter, // Expected to be { min: number, max: number }
    energyFilter,
    playfulnessFilter,
    aggressionFilter,
    sizeFilter,
    trainingFilter,
  } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);
    if (error) throw error;

    const { error: updateError } = await supabase
      .from("userdata")
      .update({
        likeabilityFilter,
        energyFilter,
        playfulnessFilter,
        aggressionFilter,
        sizeFilter,
        trainingFilter,
      })
      .eq("uuid", user.id);

    if (updateError) {
      console.error("Update Error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res
      .status(200)
      .json({ message: "Dog traits updated successfully." });
  } catch (error) {
    console.error("Error updating dog traits:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/current-dog-filters", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;

    const { data: userData, error: dataError } = await supabase
      .from("userdata")
      .select(
        "likeabilityFilter, energyFilter, playfulnessFilter, aggressionFilter, sizeFilter, trainingFilter"
      )
      .eq("uuid", user.id)
      .single();

    if (dataError) {
      throw dataError;
    }

    return res.status(200).json({ userFilters: userData });
  } catch (error) {
    console.error("Error fetching dog traits:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch dog traits: " + error.message });
  }
});

app.post("/update-max-distance", async (req, res) => {
  const { accessToken, maxDistance } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);
    if (error) {
      throw error;
    }

    const { error: updateError } = await supabase
      .from("userdata")
      .update({ maxDistance })
      .eq("uuid", user.id);

    if (updateError) {
      console.error("Update Error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res
      .status(200)
      .json({ message: "Max distance updated successfully" });
  } catch (error) {
    console.error("Error updating max distance:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/max-distance", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;

    const { data, error: dataError } = await supabase
      .from("userdata")
      .select("maxDistance")
      .eq("uuid", user.id)
      .single();

    if (dataError) {
      throw dataError;
    }

    if (data) {
      return res.status(200).json({ maxDistance: data.maxDistance });
    } else {
      return res.status(404).json({ error: "User data not found." });
    }
  } catch (error) {
    console.error("Error fetching max distance:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/current-dog-pictures", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) {
      console.error("Authentication error:", userError.message);
      return res
        .status(401)
        .json({ error: "Authentication failed: " + userError.message });
    }

    const { data: userData, error: dataError } = await supabase
      .from("images")
      .select("*")
      .eq("uuid", user.id);

    if (dataError) {
      console.error("Data fetch error:", dataError.message);
      throw dataError;
    }
    console.log(userData);
    if (userData.length === 0) {
      return res.status(404).json({ error: "No images found for the user." });
    }

    return res.status(200).json({ images: userData });
  } catch (error) {
    console.error("Error fetching dog images:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch dog images: " + error.message });
  }
});
app.post("/update-dog-pictures", async (req, res) => {
  const { accessToken, ...pictures } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);
    if (error) {
      console.error("Authentication error:", error.message);
      return res
        .status(401)
        .json({ error: "Authentication failed: " + error.message });
    }

    const updates = Object.keys(pictures).reduce((acc, key) => {
      if (key.startsWith("picture") && pictures[key]) {
        acc[key] = pictures[key];
      }
      return acc;
    }, {});

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No pictures provided for update" });
    }

    updates.uuid = user.id;

    const { error: upsertError } = await supabase
      .from("images")
      .upsert(updates, {
        returning: "minimal",
      });

    if (upsertError) {
      console.error("Upsert Error:", upsertError.message);
      return res.status(500).json({
        error:
          "Failed to update or insert dog pictures: " + upsertError.message,
      });
    }

    return res
      .status(200)
      .json({ message: "Dog pictures updated successfully." });
  } catch (error) {
    console.error("Error uploading image:", error);
    if (error.response) {
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }
    console.error("Error config:", error.config);
  }
});

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

app.post("/update-bio", async (req, res) => {
  const { accessToken, bio } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  if (bio === undefined) {
    return res.status(400).json({ error: "Bio content is required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;

    const { error: updateError } = await supabase
      .from("userdata")
      .update({ bio: bio })
      .eq("uuid", user.id);

    if (updateError) {
      console.error("Update Error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ message: "Bio updated successfully" });
  } catch (error) {
    console.error("Error updating bio:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/get-bio", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;

    const { data: userData, error: dataError } = await supabase
      .from("userdata")
      .select("bio")
      .eq("uuid", user.id)
      .single();

    if (dataError) {
      throw dataError;
    }

    if (userData) {
      return res.status(200).json({ bio: userData.bio });
    } else {
      return res.status(404).json({ error: "User bio not found." });
    }
  } catch (error) {
    console.error("Error fetching bio:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/get-location", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;

    const { data: basicInfo, error: basicInfoError } = await supabase
      .from("users")
      .select("address")
      .eq("uuid", user.id)
      .single();

    if (basicInfoError) {
      throw basicInfoError;
    }

    if (!basicInfo.address) {
      return res.status(404).json({ error: "No address found for this user." });
    }

    const positionStackApiKey = "be2efb6b90f3a1015d928b4186ca5ec4";
    const formattedAddress = encodeURIComponent(basicInfo.address);
    const positionStackUrl = `http://api.positionstack.com/v1/forward?access_key=${positionStackApiKey}&query=${formattedAddress}`;

    const response = await axios.get(positionStackUrl);

    if (!response.data.data || response.data.data.length === 0) {
      return res
        .status(404)
        .json({ error: "No location data found for this address." });
    }

    const locationData = response.data.data[0];

    const { error: updateError } = await supabase
      .from("userdata")
      .update({
        longitude: locationData.longitude,
        latitude: locationData.latitude,
      })
      .eq("uuid", user.id);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      message: "Location updated successfully",
      longitude: locationData.longitude,
      latitude: locationData.latitude,
    });
  } catch (error) {
    console.error("Error fetching or updating location data:", error.message);
    return res.status(500).json({ error: error.message });
  }
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

app.get("/messages", async (req, res) => {
  const { user_from, user_to } = req.query;
  console.log("Fetching messages between:", user_from, "and", user_to);

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `user_from.eq.${user_from},user_to.eq.${user_to},user_from.eq.${user_to},user_to.eq.${user_from}`
      )
      .order("time_sent", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Messages fetched:", data);
    res.json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error occurred." });
  }
});

app.post("/send-message", async (req, res) => {
  const { user_from, user_to, text } = req.body;
  try {
    const { data, error } = await supabase.from("messages").insert([
      {
        user_from,
        user_to,
        message_content: text,
        time_sent: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error sending message:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/find-matches", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required." });
  }

  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError) throw userError;
    if (!user) return res.status(404).json({ error: "User not found." });

    const uuid = user.id;

    const { data: likesSent, error: likesSentError } = await supabase
      .from("relation")
      .select("user_to")
      .eq("user_from", uuid)
      .eq("type", 1);

    if (likesSentError) throw likesSentError;

    const { data: likesReceived, error: likesReceivedError } = await supabase
      .from("relation")
      .select("user_from")
      .eq("user_to", uuid)
      .eq("type", 1);

    if (likesReceivedError) throw likesReceivedError;

    const sentUUIDs = new Set(likesSent.map((like) => like.user_to));
    const receivedUUIDs = new Set(likesReceived.map((like) => like.user_from));

    const mutualLikes = [...sentUUIDs].filter((userTo) =>
      receivedUUIDs.has(userTo)
    );

    if (mutualLikes.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(
          "uuid, human_first_name, human_last_name, address, dog_name, created_at, last_active, user_level"
        )
        .in("uuid", mutualLikes);

      if (usersError) throw usersError;

      const picturePromises = mutualLikes.map((userId) =>
        supabase.from("images").select("picture1").eq("uuid", userId).single()
      );
      const picturesResults = await Promise.all(picturePromises);
      const pictureData = picturesResults.reduce((acc, result, index) => {
        if (!result.error) {
          acc[mutualLikes[index]] = result.data.picture1;
        }
        return acc;
      }, {});

      const matches = usersData.map((user) => ({
        ...user,
        picture1: pictureData[user.uuid] || "Default image URL or null if none",
      }));

      return res.status(200).json({ matches });
    } else {
      return res
        .status(200)
        .json({ message: "No matches found.", matches: [] });
    }
  } catch (error) {
    console.error("Error finding matches:", error.message);
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
