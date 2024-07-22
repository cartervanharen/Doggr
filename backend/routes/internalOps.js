/** 
 *         ____                                  
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /    
 *     /_____/  \____/  \__, /   \__, /  /_/     
 *                     /____/   /____/           
 *
 * @fileoverview This file contains the router definitions for internal API endpoints that manage user data.
 * These endpoints are used primarily for administrative tasks such as managing user accounts, interactions, and testing.
 * These routes are intended for use by system administrators and should ideally be protected by appropriate authentication mechanisms.
 * 
 * @author Carter VanHaren
 */

import express from "express";
import { supabase } from "../utils/supabaseClient.js";
const router = express.Router();

/**
 * Gets a list of all users in the user table.
 * @route GET /get-all-users
 * @returns {Object[]} data - Array of all user records.
 * @returns {Error} 500 - Bubbled up error object with message.
 */
router.get("/get-all-users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

/**
 * Gets a list of all user UUIDs in the users table.
 * @route GET /get-all-uuid
 * @returns {Object[]} data - Array of user UUIDs.
 * @returns {Error} 500 - Bubbled up error object with message.
 */
router.get("/get-all-uuid", async (req, res) => {
  const { data, error } = await supabase.from("users").select("uuid");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

/**
 * Gets a list of all user data entries in the userdata table.
 * @route GET /get-all-userdata
 * @returns {Object[]} data - Array of all user data records.
 * @returns {Error} 500 - Bubbled up error object with message.
 */
router.get("/get-all-userdata", async (req, res) => {
  const { data, error } = await supabase.from("userdata").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

/**
 * Fetches user data based on the provided access token
 *
 * How it works:
 * 1. Fetches the UUID from the auth table
 * 2. Selects the record from the userdata table via UUID.
 *
 * @route POST /userdata
 * @param {string} req.body.accessToken - Access token to authenticate and identify the user.
 * @returns {Object} user - User data for the authenticated user.
 * @returns {Error} 403 - Access token missing.
 * @returns {Error} 401 - Unauthorized or other errors.
 */
router.post("/userdata", async (req, res) => {
  const token = req.body.accessToken;
  if (!token) {
    return res.status(403).json({ error: "Access token is required" });
  }
  try {
    const { data: user } = await supabase.auth.api.getUser(token);
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

/**
 * Fetches all relationship entries in the relation table.
 * @route GET /get-all-relation
 * @returns {Object[]} data - Array of all relation records.
 * @returns {Error} 500 - Bubbled up error object with message.
 */
router.get("/get-all-relation", async (req, res) => {
  const { data, error } = await supabase.from("relation").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

/**
 * Updates the location data for all users based on their address.
 *
 * How it works:
 * 1. Fetches all users' UUIDs and addresses from the database.
 * 2. For each user with a valid address, encodes the address and constructs a URL to query the PositionStack API.
 * 3. Sends a request to the PositionStack API to convert the encoded address into latitude and longitude.
 * 4. Collects the latitude and longitude data for each user and prepares bulk updates.
 * 5. Performs an upsert operation to update the userdata table with the new location data for each user.
 * 6. Returns a success message with the count of updated records or an error if the operation fails.
 *
 * @route GET /update-all-locations
 * @returns {string} message - Success message with count of updated records.
 * @returns {Error} 500 - Error during fetching users or updating their location.
 */
router.get("/update-all-locations", async (req, res) => {
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
      if (locationResponse.data.data && locationResponse.data.data.length > 0) {
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
});

/**
 * Manually adds an interaction record between two users in the relation table.
 * @route POST /manual-add-interaction
 * @param {string} req.body.user_from - UUID of the user initiating the interaction.
 * @param {string} req.body.user_to - UUID of the recipient user.
 * @returns {string} message - Success message.
 * @returns {Error} 400 - Required fields missing.
 * @returns {Error} 500 - Error during the insertion of the interaction record.
 */
router.post("/manual-add-interaction", async (req, res) => {
  try {
    const { user_from, user_to } = req.body;
    if (!user_from || !user_to) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const { data, error } = await supabase.from("relation").insert([
      {
        user_from: user_from,
        user_to: user_to,
        type: 1,
      },
    ]);
    if (error) {
      throw error;
    }
    res.status(200).json({ message: "Interaction added successfully", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fetches user information by UUID from the userdata table.
 * @route POST /user-info-byuuid
 * @param {string} req.body.uuid - UUID of the user to fetch.
 * @returns {Object} user - User data for the specified UUID.
 * @returns {Error} 401 - Unauthorized or other errors.
 */
router.post("/user-info-byuuid", async (req, res) => {
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

/**
 * Generates new next-users entries for the specified user using the matchClosestUsers function.
 * @route POST /generate-new-nextusers
 * @param {string} req.body.userid - UUID of the user for whom to generate entries.
 * @returns {string} worked - Confirmation message if successful.
 * @returns {Error} 400 - UUID missing.
 * @returns {Error} 401 - Unauthorized or other errors.
 */
router.post("/generate-new-nextusers", async (req, res) => {
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

export default router;
