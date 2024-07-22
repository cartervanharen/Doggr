/**
 *         ____
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /
 *     /_____/  \____/  \__, /   \__, /  /_/
 *                     /____/   /____/
 *
 * @fileoverview This file contains the router definitions for the signup endpoint, 
 * designed to register new users and provision their profiles with placeholder data. 
 * This initial data setup is meant to be promptly replaced with actual user-specific information.
 * The process encapsulates the creation of user records, insertion of initial data, 
 * and configuration of user preferences and imagery, providing a comprehensive foundation 
 * for each user account at the time of registration.
 * @author Carter VanHaren
 */

import express from "express";
import { supabase } from "../utils/supabaseClient.js";
import matchClosestUsers from '../utils/userMatching.js';

const router = express.Router();

/**
 * Registers a new user and initializes their profile data, including personal details and preferences.
 * It handles the creation of a user account in Supabase Auth, inserts related data into different tables,
 * and sets up default values for user preferences and images.
 *
 * How it works:
 * 1. Receives user data from the request body.
 * 2. Validates that all required fields are present and not empty.
 * 3. Creates a new user in Supabase Auth using the provided email and password.
 * 4. Upon successful user creation, inserts user details into the 'users' table.
 * 5. Initializes user data in the 'userdata' table with default values and user preferences.
 * 6. Inserts initial dummy images for the user in the 'images' table.
 * 7. Calls the 'matchClosestUsers' function to initiate user matching based on preferences.
 * 8. If all steps are successful, returns a confirmation message with user and session details.
 * 9. If any step fails, returns an appropriate error message indicating the failure point.
 *
 * @route POST /signup
 * @param {Object} req.body - The user data for signup.
 * @param {string} req.body.email - User's email address.
 * @param {string} req.body.password - User's chosen password.
 * @param {string} req.body.human_first_name - User's first name.
 * @param {string} req.body.human_last_name - User's last name.
 * @param {string} req.body.address - User's home address.
 * @param {string} req.body.dog_name - Name of the user's dog.
 * @returns {Object} JSON - Confirmation message with user and session details upon success.
 * @returns {Error} 400 - If any required field is missing or empty.
 * @returns {Error} 500 - Internal server error for database insert issues.
 * @returns {Error} 401 - Unauthorized error if authentication fails.
 */
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
        user_level: 1 //Future featuer, paid access for additional features. 
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
          latitude: 37.485576, //Location of Meta HQ
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
    const { error: insertNextUserError } = await supabase //Empty nextuser table, populated with null values.
      .from("nextusers")
      .insert([
        {
          uuid: user.id 
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
