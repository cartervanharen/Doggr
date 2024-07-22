/**
 *         ____
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /
 *     /_____/  \____/  \__, /   \__, /  /_/
 *                     /____/   /____/
 *
 * @fileoverview This file contains the router definitions for internal API endpoints that manage user and dog data for Doggr.
 * These endpoints handle operations such as updating user information, dog traits, filtering preferences, and dog pictures.
 * Comprehensive error handling and response mechanisms are implemented to ensure reliable transactions.
 * 
 * @author Carter VanHaren
 */

import express from "express";
import { supabase } from "../utils/supabaseClient.js";
const router = express.Router();

/**
 * Route to update user information.
 * @route POST /update-user-info
 * @param {string} accessToken - The access token for authentication.
 * @param {string} firstName - The first name of the user.
 * @param {string} lastName - The last name of the user.
 * @param {string} dogName - The name of the user's dog.
 * @param {string} address - The address of the user.
 * @param {string} email - The email address of the user.
 * @returns {Object} A success message or an error message.
 */
router.post("/update-user-info", async (req, res) => {
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

/**
 * Route to update dog traits.
 * @route POST /update-dog-traits
 * @param {string} accessToken - The access token for authentication.
 * @param {number} likeability - The likeability trait of the dog.
 * @param {number} energy - The energy level of the dog.
 * @param {number} playfulness - The playfulness level of the dog.
 * @param {number} aggression - The aggression level of the dog.
 * @param {number} size - The size of the dog.
 * @param {number} training - The training level of the dog.
 * @returns {Object} A success message or an error message.
 */
router.post("/update-dog-traits", async (req, res) => {
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

/**
 * Route to update dog trait filters.
 * @route POST /update-dog-filter
 * @param {string} accessToken - The access token for authentication.
 * @param {Object} likeabilityFilter - The likeability filter for the dog.
 * @param {Object} energyFilter - The energy filter for the dog.
 * @param {Object} playfulnessFilter - The playfulness filter for the dog.
 * @param {Object} aggressionFilter - The aggression filter for the dog.
 * @param {Object} sizeFilter - The size filter for the dog.
 * @param {Object} trainingFilter - The training filter for the dog.
 * @returns {Object} A success message or an error message.
 */
router.post("/update-dog-filter", async (req, res) => {
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


/**
 * Route to update the maximum distance of users to show.
 * @route POST /update-max-distance
 * @param {string} accessToken - The access token for authentication.
 * @param {number} maxDistance - The maximum distance.
 * @returns {Object} A success message or an error message.
 */
router.post("/update-max-distance", async (req, res) => {
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

/**
 * Route to update dog pictures.
 * @route POST /update-dog-pictures
 * @param {string} accessToken - The access token for authentication.
 * @param {...Object} pictures - The dog pictures to update.
 * @returns {Object} A success message or an error message.
 */
router.post("/update-dog-pictures", async (req, res) => {
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
    return res.status(200).json({ message: "Dog pictures updated successfully." });
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

/**
 * Route to update the user bio.
 * @route POST /update-bio
 * @param {string} accessToken - The access token for authentication.
 * @param {string} bio - The bio content.
 * @returns {Object} A success message or an error message.
 */
router.post("/update-bio", async (req, res) => {
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

export default router;
