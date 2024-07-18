import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3000;
const supabaseUrl = "https://oewelgbnnzgyamhpxyqs.supabase.co";
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld2VsZ2JubnpneWFtaHB4eXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzQ0MDIsImV4cCI6MjAzNDkxMDQwMn0.wrKCzM1wbzyTLwBN7xbYu2mzS2GzQ6zAWHNe9Wv1BBo`;
app.use(express.json());
app.use(cors());
import axios from "axios";

const supabase = createClient(supabaseUrl, supabaseKey);

function calculateDistance(lat1, lon1, lat2, lon2) {
  //haversine formula
  const R = 3959; //earth radius
  const dLat = degeesRadian(lat2 - lat1);
  const dLon = degeesRadian(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degeesRadian(lat1)) *
      Math.cos(degeesRadian(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function degeesRadian(deg) {
  return deg * (Math.PI / 180);
}

app.use(express.json());

app.get("/update-all-locations", async (req, res) => {
  try {
    const { data: allUsers, error: userFetchError } = await supabase
      .from("users")
      .select("uuid, address");

    if (userFetchError) throw userFetchError;

    const positionStackApiKey = "be2efb6b90f3a1015d928b4186ca5ec4";
    const updates = [];

    for (const user of allUsers) {
      if (user.address) {
        const formattedAddress = encodeURIComponent(user.address);
        const positionStackUrl = `http://api.positionstack.com/v1/forward?access_key=${positionStackApiKey}&query=${formattedAddress}`;

        const locationResponse = await axios.get(positionStackUrl);
        if (
          locationResponse.data.data &&
          locationResponse.data.data.length > 0
        ) {
          const locationData = locationResponse.data.data[0];
          updates.push({
            uuid: user.uuid,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          });
        }
      }
    }

    const { error: updateError } = await supabase
      .from("userdata")
      .upsert(updates);

    if (updateError) throw updateError;

    return res.status(200).json({
      message: "Locations updated successfully for all users",
      updatedCount: updates.length,
    });
  } catch (error) {
    console.error("Error updating locations for all users:", error.message);
    return res.status(500).json({ error: error.message });
  }
});
app.post("/user-info-byuuid", async (req, res) => {
  const uuid = req.body.uuid;

  try {
    const { data: userData, fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("uuid", uuid)
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

app.get("/get-all-users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});
app.get("/get-all-uuid", async (req, res) => {
  const { data, error } = await supabase.from("users").select("uuid");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get("/get-all-userdata", async (req, res) => {
  const { data, error } = await supabase.from("userdata").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.get("/get-all-relation", async (req, res) => {
  const { data, error } = await supabase.from("relation").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { user, session, error } = await supabase.auth.signIn({
      email: email,
      password: password,
    });

    if (error) throw error;
    const access_token = session.access_token;
    return res.status(200).json({ access_token });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

app.post("/generate-new-nextusers", async (req, res) => {
  const { userid } = req.body;

  if (!userid) {
    return res.status(400).json({ error: "Need to inclued uuid" });
  }

  try {
    matchClosestUsers(userid);
    return res.status(200).json("worked");
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

app.post("/verify-token", async (req, res) => {
  const token = req.body.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ error: "A token is required for authentication" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(token);

    if (error) {
      throw error;
    }

    return res.status(200).json({ message: "Token is valid", user });
  } catch (error) {
    return res.status(401).json({ error: "Invalid Token or Token Expired" });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { user, session, error } = await supabase.auth.signIn({
      email: email,
      password: password,
    });

    if (error) throw error;

    return res.status(200).json({ message: "Login successful", user, session });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

app.post("/signup", async (req, res) => {
  const {
    email,
    password,
    human_first_name,
    human_last_name,
    address,
    dog_name,
  } = req.body;

  const currentTime = new Date().toISOString();

  if (
    !email ||
    !password ||
    !human_first_name ||
    !human_last_name ||
    !address ||
    !dog_name
  ) {
    return res
      .status(400)
      .json({ error: "All fields are required and must not be empty" });
  }
  try {
    const { user, session, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    const { error: insertError } = await supabase.from("users").insert([
      {
        uuid: user.id,
        human_first_name: human_first_name,
        human_last_name: human_last_name,
        address: address,
        dog_name: dog_name,
        created_at: currentTime,
        last_active: currentTime,
        user_level: 1,
      },
    ]);

    if (insertError) {
      console.error("Insert Error:", insertError.message);
      return res.status(500).json({ error: insertError.message });
    }

    const { error: insertUserDataError } = await supabase
      .from("userdata")
      .insert([
        {
          uuid: user.id,
          likeability: 5,
          energy: 5,
          playfulness: 5,
          aggression: 5,
          size: 5,
          training: 5,
          maxDistance: 1,
          likeabilityFilter: { min: 1, max: 10 },
          energyFilter: { min: 1, max: 10 },
          playfulnessFilter: { min: 1, max: 10 },
          aggressionFilter: { min: 1, max: 10 },
          sizeFilter: { min: 1, max: 10 },
          trainingFilter: { min: 1, max: 10 },
        },
      ]);

    if (insertUserDataError) {
      throw insertUserDataError;
    }

    const { error: insertNextUserError } = await supabase
      .from("nextusers")
      .insert([
        {
          uuid: user.id,
        },
      ]);

    if (insertNextUserError) {
      throw insertNextUserError;
    }

    const { error: insertImagesError } = await supabase.from("images").insert([
      {
        uuid: user.id,
        picture1: "https://i.ibb.co/nwPz4Hw/blank.jpg",
        picture2: "https://i.ibb.co/nwPz4Hw/blank.jpg",
        picture3: "https://i.ibb.co/nwPz4Hw/blank.jpg",
        picture4: "https://i.ibb.co/nwPz4Hw/blank.jpg",
        picture5: "https://i.ibb.co/nwPz4Hw/blank.jpg",
      },
    ]);

    if (insertImagesError) {
      throw insertImagesError;
    }

    return res
      .status(200)
      .json({ message: "User account created successfully", user, session });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

app.get("/allusr", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.post("/userdata", async (req, res) => {
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
      .from("userdata")
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

app.post("/user-info", async (req, res) => {
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
      return res
        .status(500)
        .json({
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

app.post("/new-signup-base-data", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);

    const { error: insertUserDataError } = await supabase
      .from("userdata")
      .insert([
        {
          uuid: user.id,
          likeability: 5,
          energy: 5,
          playfulness: 5,
          aggression: 5,
          size: 5,
          training: 5,
          maxDistance: 1,
          likeabilityFilter: { min: 1, max: 10 },
          energyFilter: { min: 1, max: 10 },
          playfulnessFilter: { min: 1, max: 10 },
          aggressionFilter: { min: 1, max: 10 },
          sizeFilter: { min: 1, max: 10 },
          trainingFilter: { min: 1, max: 10 },
        },
      ]);

    if (insertUserDataError) {
      throw insertUserDataError;
    }

    const { error: insertImagesError } = await supabase.from("images").insert([
      {
        uuid: user.id,
        picture1: "https://i.ibb.co/nwPz4Hw/blank.jpg",
        picture2: "https://i.ibb.co/nwPz4Hw/blank.jpg",
        picture3: "https://i.ibb.co/nwPz4Hw/blank.jpg",
        picture4: "https://i.ibb.co/nwPz4Hw/blank.jpg",
        picture5: "https://i.ibb.co/nwPz4Hw/blank.jpg",
      },
    ]);

    if (insertImagesError) {
      throw insertImagesError;
    }

    return res
      .status(200)
      .json({ message: "User account created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(401).json({ error: error.message });
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
      return res.status(404).json({ error: "No user data found" });
    }
  } catch (error) {
    console.error("Processing error:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to process request: " + error.message });
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
    return res
      .status(500)
      .json({ error: "Failed to retrieve user data: " + error.message });
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

  if (nextUserNum > 5) {
    console.log("Over 5, reloading users now");
    try {
      outofuserstate = await matchClosestUsers(userId);
      console.log(outofuserstate);
    } catch (error) {
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
    return res.status(500).json({
      error: "Failed to retrieve current user data: " + error.message,
    });
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

app.post("/signup-complete", async (req, res) => {
  const {
    email,
    password,
    human_first_name,
    human_last_name,
    address,
    dog_name,
    bio,
    picture1,
    picture2,
    picture3,
    picture4,
    picture5,
    likeability,
    energy,
    playfulness,
    aggression,
    size,
    training,
  } = req.body;

  const currentTime = new Date().toISOString();

  if (
    !email ||
    !password ||
    !human_first_name ||
    !human_last_name ||
    !address ||
    !dog_name ||
    !picture1 ||
    !picture2 ||
    !picture3 ||
    !picture4 ||
    !picture5
  ) {
    return res
      .status(400)
      .json({ error: "All fields are required and must not be empty" });
  }

  try {
    // Sign up the user
    const {
      user,
      session,
      error: signupError,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      throw signupError;
    }

    const { error: insertUserError } = await supabase.from("users").insert([
      {
        uuid: user.id,
        human_first_name,
        human_last_name,
        address,
        dog_name,
        created_at: currentTime,
        last_active: currentTime,
        user_level: 1,
      },
    ]);

    if (insertUserError) {
      throw insertUserError;
    }

    const { error: insertNextUserError } = await supabase
      .from("nextusers")
      .insert([
        {
          uuid: user.id,
          nextuser: 1,
          user1: user.id,
        },
      ]);

    if (insertNextUserError) {
      throw insertNextUserError;
    }

    const { error: insertUserDataError } = await supabase
      .from("userdata")
      .insert([
        {
          uuid: user.id,
          likeability,
          energy,
          playfulness,
          aggression,
          size,
          bio,
          training,
          maxDistance: 1,
          likeabilityFilter: { min: 1, max: 10 },
          energyFilter: { min: 1, max: 10 },
          playfulnessFilter: { min: 1, max: 10 },
          aggressionFilter: { min: 1, max: 10 },
          sizeFilter: { min: 1, max: 10 },
          trainingFilter: { min: 1, max: 10 },
        },
      ]);

    if (insertUserDataError) {
      throw insertUserDataError;
    }

    const { error: insertImagesError } = await supabase.from("images").insert([
      {
        uuid: user.id,
        picture1,
        picture2,
        picture3,
        picture4,
        picture5,
      },
    ]);

    if (insertImagesError) {
      throw insertImagesError;
    }

    const positionStackApiKey = "be2efb6b90f3a1015d928b4186ca5ec4";
    const formattedAddress = encodeURIComponent(address);
    const positionStackUrl = `http://api.positionstack.com/v1/forward?access_key=${positionStackApiKey}&query=${formattedAddress}`;

    const response = await axios.get(positionStackUrl);

    if (!response.data.data || response.data.data.length === 0) {
      throw new Error("No location data found for the provided address.");
    }

    const locationData = response.data.data[0];

    const { error: updateLocationError } = await supabase
      .from("userdata")
      .update({
        longitude: locationData.longitude,
        latitude: locationData.latitude,
      })
      .eq("uuid", user.id);

    if (updateLocationError) {
      throw updateLocationError;
    }

    return res
      .status(200)
      .json({ message: "User account created successfully", user, session });
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(401).json({ error: error.message });
  }
});
async function matchClosestUsers(uuid) {
  let outofusers = 0;
  if (!uuid) {
    throw new Error("UUID is required");
  }

  const { data: currentUserData, error: currentUserDataError } = await supabase
    .from("userdata")
    .select(
      "latitude, longitude, maxDistance, likeability, energy, playfulness, aggression, size, training, likeabilityFilter, energyFilter, playfulnessFilter, aggressionFilter, sizeFilter, trainingFilter"
    )
    .eq("uuid", uuid)
    .single();

  if (currentUserDataError) {
    throw new Error(
      `Error fetching current user data: ${currentUserDataError.message}`
    );
  }

  const predictedTraitsResponse = await fetch(
    `http://localhost:3001/predict?trait1=${currentUserData.likeability}&trait2=${currentUserData.energy}&trait3=${currentUserData.playfulness}&trait4=${currentUserData.aggression}&trait5=${currentUserData.size}&trait6=${currentUserData.training}`
  );
  const predictedTraits = await predictedTraitsResponse.json();

  const { data: relations, error: relationsError } = await supabase
    .from("relation")
    .select("user_to, user_from")
    .or(`user_from.eq.${uuid},user_to.eq.${uuid}`);

  if (relationsError) {
    throw new Error(`Error fetching relations: ${relationsError.message}`);
  }

  const seenUserIds = new Set(
    relations.map((relation) =>
      relation.user_from === uuid ? relation.user_to : relation.user_from
    )
  );

  const { data: allUsers, error: allUsersError } = await supabase
    .from("userdata")
    .select("*")
    .not("uuid", "eq", uuid);

  if (allUsersError) {
    throw new Error(`Error fetching all users: ${allUsersError.message}`);
  }

  const filteredAndSortedUsers = allUsers
    .filter((user) => {
      const distance = calculateDistance(
        currentUserData.latitude,
        currentUserData.longitude,
        user.latitude,
        user.longitude
      );

      return (
        !seenUserIds.has(user.uuid) &&
        distance <= currentUserData.maxDistance &&
        [
          "likeability",
          "energy",
          "playfulness",
          "aggression",
          "size",
          "training",
        ].every((trait) => {
          const filter = currentUserData[`${trait}Filter`];
          if (filter) {
            return user[trait] >= filter.min && user[trait] <= filter.max;
          }
          return true;
        })
      );
    })
    .sort((a, b) => {
      const scoreA = predictedTraits.predicted_traits.reduce(
        (acc, trait, index) => {
          acc += Math.abs(trait - a[`trait${index + 1}`]);
          return acc;
        },
        0
      );
      const scoreB = predictedTraits.predicted_traits.reduce(
        (acc, trait, index) => {
          acc += Math.abs(trait - b[`trait${index + 1}`]);
          return acc;
        },
        0
      );
      return scoreA - scoreB;
    })
    .slice(0, 10);

  if (filteredAndSortedUsers.length === 0) {
    console.log("****no new users");
    outofusers = 1;
    return outofusers;
  }

  const upsertData = {
    uuid: uuid,
    nextuser: 1,
  };

  for (let i = 1; i <= 10; i++) {
    upsertData[`user${i}`] = filteredAndSortedUsers[i - 1]
      ? filteredAndSortedUsers[i - 1].uuid
      : null;
  }

  const { error: updateError } = await supabase
    .from("nextusers")
    .upsert(upsertData, { returning: "minimal" });

  if (updateError) {
    throw new Error(`Error updating next users: ${updateError.message}`);
  }

  return outofusers;
}


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
      const { data: user, error: userError } = await supabase.auth.api.getUser(accessToken);
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

      const sentUUIDs = new Set(likesSent.map(like => like.user_to));
      const receivedUUIDs = new Set(likesReceived.map(like => like.user_from));

      const mutualLikes = [...sentUUIDs].filter(userTo => receivedUUIDs.has(userTo));

      if (mutualLikes.length > 0) {
          const { data: matchDetails, error: detailsError } = await supabase
              .from("users")
              .select("*")
              .in("uuid", mutualLikes);

          if (detailsError) throw detailsError;

          return res.status(200).json({ matches: matchDetails });
      } else {
          return res.status(200).json({ message: "No matches found.", matches: [] });
      }
  } catch (error) {
      console.error("Error finding matches:", error.message);
      return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
