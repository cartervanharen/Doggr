import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3000;
const supabaseUrl = "https://oewelgbnnzgyamhpxyqs.supabase.co";
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld2VsZ2JubnpneWFtaHB4eXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzQ0MDIsImV4cCI6MjAzNDkxMDQwMn0.wrKCzM1wbzyTLwBN7xbYu2mzS2GzQ6zAWHNe9Wv1BBo`;
app.use(express.json());
app.use(cors());

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

app.get("/allusr", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.post("/login", async (req, res) => {
  console.log("Login route hit");

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
    // return res.status(200).json({ message: 'Login successful', user, session });
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
  console.log("Signin route hit");

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
  console.log("Signup route hit");
  const {
    email,
    password,
    human_first_name,
    human_last_name,
    address,
    dog_name,
  } = req.body;

  const currentTime = new Date().toISOString();
  console.log(req.body);
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

  console.log(req.body);

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
    if (userError) throw userError;

    const { data: userData, error: dataError } = await supabase
      .from("images")
      .select("picture1, picture2, picture3, picture4, picture5")
      .eq("uuid", user.id)
      .single();

    if (dataError) {
      throw dataError;
    }

    return res.status(200).json({ userFilters: userData });
  } catch (error) {
    console.error("Error fetching dog images:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch dog images: " + error.message });
  }
});

app.post("/update-dog-pictures", async (req, res) => {
  const { accessToken, picture1, picture2, picture3, picture4, picture5 } =
    req.body;

  console.log(req.body);

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);
    if (error) throw error;

    const { error: updateError } = await supabase
      .from("images")
      .update({
        picture1,
        picture2,
        picture3,
        picture4,
        picture5,
      })
      .eq("uuid", user.id);

    if (updateError) {
      console.error("Update Error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res
      .status(200)
      .json({ message: "Dog pictures updated successfully." });
  } catch (error) {
    console.error("Error updating dog pictures:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/update-dog-pictures", async (req, res) => {
  const { accessToken, picture1, picture2, picture3, picture4, picture5 } =
    req.body;

  console.log(req.body);

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);
    if (error) throw error;

    const { error: updateError } = await supabase
      .from("images")
      .update({
        picture1,
        picture2,
        picture3,
        picture4,
        picture5,
      })
      .eq("uuid", user.id);

    if (updateError) {
      console.error("Update Error:", updateError.message);
      return res.status(500).json({ error: updateError.message });
    }

    return res
      .status(200)
      .json({ message: "Dog pictures updated successfully." });
  } catch (error) {
    console.error("Error updating dog pictures:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/new-signup-base-data", async (req, res) => {
  console.log("Signup route hit");

  const { accessToken } = req.body;

  console.log(req.body);

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
  let nextUserUuid = "null";

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
      throw new Error("Authentication failed");
    }

    if (!user) {
      console.error("No user found with provided access token");
      return res.status(404).json({ error: "User not found" });
    }

    const { data: userData, error: dataError } = await supabase
      .from("nextusers")
      .select("*")
      .eq("uuid", user.id)
      .single();

    if (dataError) {
      console.error("Database query error:", dataError.message);
      throw new Error("Error fetching user data");
    }

    if (userData) {
      const nextUserField = `user${userData.nextuser}`;
      const nextUserId = userData[nextUserField];
      console.log(`Next user ID for user${userData.nextuser}: ${nextUserId}`);

      nextUserUuid = nextUserId;
      return res.status(200).json({ userUUID: nextUserUuid, test: "test" });
    } else {
      return res.status(404).json({ error: "No user data found" });
    }
  } catch (error) {
    console.error("Processing error:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to process request: " + error.message });
  }
});






































app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
