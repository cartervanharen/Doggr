import express from "express";
import supabase from "../utils/supabaseClient.js";
const router = express.Router();
const matchClosestUsers = require("/utils/userMatching.jsx");

router.post("/signup", async (req, res) => {
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
          longitude: -122.147966,
          latitude: 37.485576,
          likeability: 5,
          energy: 5,
          playfulness: 5,
          aggression: 5,
          size: 5,
          training: 5,
          maxDistance: 50,
          likeabilityFilter: { min: 1, max: 10 },
          energyFilter: { min: 1, max: 10 },
          playfulnessFilter: { min: 1, max: 10 },
          aggressionFilter: { min: 1, max: 10 },
          sizeFilter: { min: 1, max: 10 },
          trainingFilter: { min: 1, max: 10 },
        },
      ]);
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
    matchClosestUsers(user.id);
    return res
      .status(200)
      .json({ message: "User account created successfully", user, session });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});
export default router;
