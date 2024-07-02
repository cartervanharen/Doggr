import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = "https://oewelgbnnzgyamhpxyqs.supabase.co";
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld2VsZ2JubnpneWFtaHB4eXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzQ0MDIsImV4cCI6MjAzNDkxMDQwMn0.wrKCzM1wbzyTLwBN7xbYu2mzS2GzQ6zAWHNe9Wv1BBo`;
import jwt from "jsonwebtoken";

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
  const token = req.body.authorization?.split(" ")[1]; // Bearer <token>

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

async function signUp(email, password) {
  const { user, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });
  if (error) {
    console.error("Error signing up:", error.message);
    return null; // Return null or handle the error as needed
  } else {
    console.log("User signed up:", user.id);
    return user.id; // Return the UUID of the new user
  }
}
//   signUp('user3@example.com', 'password123')

app.post('/signin', async (req, res) => {
    console.log("Signin route hit");

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const { user, session, error } = await supabase.auth.signIn({
            email: email,
            password: password
        });

        if (error) throw error;

        return res.status(200).json({ message: 'Login successful', user, session });
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }//add get token
});

app.post('/signup', async (req, res) => {
    console.log("Signup route hit");

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const { user, session, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) throw error;

        return res.status(200).json({ message: 'Signup successful', user, session });
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
});





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



app.get("/allusr", async (req, res) => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

//   app.post("/adduser", async (req, res) => {
//     const {
//       human_first_name,
//       human_last_name,
//       email,
//       address,
//       dog_name,
//       password,
//     } = req.body;
//     let userCreated = null;
//     let token = null;
  
//     try {
//       const { user, error: signUpError } = await supabase.auth.signUp({
//         email,
//         password,
//       });
//       if (signUpError) throw signUpError;
//       userCreated = user;
//     } catch (error) {
//       console.error("Error signing up:", error.message);
//     }
  
//     try {
//       if (userCreated) {
//         const currentTime = new Date().toISOString();
//         const { data, error: insertError } = await supabase.from("users").insert([
//           {
//             uuid: userCreated.id,
//             human_first_name,
//             human_last_name,
//             address,
//             dog_name,
//             created_at: currentTime,
//             last_active: currentTime,
//             user_level: 1,
//           },
//         ]);
//         if (insertError) throw insertError;
//       }
//     } catch (error) {
//       console.error("Error inserting user details:", error.message);
//     }
  
  
//     try {
  
//         const { session, error: signInError } = await supabase.auth.signIn({
//           email: email,
//           password: password,
//         });
//         if (signInError) throw signInError;
//         token = session.access_token;
  
//     } catch (error) {
//       console.error("Error signing in:", error.message);
//     }
  
//     if (userCreated && token) {
//       res.status(201).json({
//         message: "User created and logged in successfully",
//         access_token: token,
//       });
//     } else {
//       res.status(500).json({
//         error: "Failed to complete all operations",
//         userCreated: !!userCreated,
//         tokenReceived: !!token,
//       });
//     }
//   });
  