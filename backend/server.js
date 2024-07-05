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

app.post("/update-dog-traits", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
