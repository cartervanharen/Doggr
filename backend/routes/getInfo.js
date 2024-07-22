/**
 *         ____
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /
 *     /_____/  \____/  \__, /   \__, /  /_/
 *                     /____/   /____/
 *
 * @fileoverview FILL IN STILL
 * @author Carter VanHaren
 */

import express from "express";
import { supabase } from "../utils/supabaseClient.js";
import axios from "axios";
const router = express.Router();

/**
 * Retrieves user information.
 * @route GET /get-user-info
 * @param {string} accessToken - The access token for authentication.
 * @returns {Object} The user's personal details or an error message.
 */
router.get("/get-user-info", async (req, res) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return res.status(403).json({ error: "Access token is required" });
  }
  try {
    const { data: user, error } = await supabase.auth.api.getUser(accessToken);
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

/**
 * Retrieves the current dog trait filters for a user.
 * @route GET /current-dog-filters
 * @param {string} accessToken - The access token for authentication.
 * @returns {Object} The user's dog trait filters or an error message.
 */
router.get("/get-dog-filters", async (req, res) => {
  const accessToken = req.headers.authorization;
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

/**
 * Retrieves the maximum allowable distance for dog matching.
 * @route GET /max-distance
 * @param {string} accessToken - The access token for authentication.
 * @returns {Object} The user's maximum distance or an error message.
 */
router.get("/get-max-distance", async (req, res) => {
  const accessToken = req.headers.authorization;
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

/**
 * Retrieves the current dog pictures for a user.
 * @route GET /current-dog-pictures
 * @param {string} accessToken - The access token for authentication.
 * @returns {Object} The user's dog pictures or an error message.
 */
router.get("/get-dog-pictures", async (req, res) => {
  const accessToken = req.headers.authorization;
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

/**
 * Retrieves the user's bio information.
 * @route GET /get-bio
 * @param {string} accessToken - The access token for authentication.
 * @returns {Object} The user's bio or an error message.
 */
router.get("/get-bio", async (req, res) => {
  const accessToken = req.headers.authorization;
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

/**
 * Retrieves and updates the user's geographical location based on their address.
 *
 * How it works:
 * 1. Fetches the UUID from the access token
 * 2. Uses the (free) Position Stack API to get the coordinates of the the entered address.
 * 3. Updates the coordinates in the userdata table.
 *
 * @route GET /get-location
 * @param {string} accessToken - The access token for authentication.
 * @returns {Object} The user's updated location or an error message.
 */
router.get("/get-location", async (req, res) => {
  const accessToken = req.headers.authorization;
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

export default router;
