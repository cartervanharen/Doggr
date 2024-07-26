/**
 *         ____
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /
 *     /_____/  \____/  \__, /   \__, /  /_/
 *                     /____/   /____/
 *
 * @fileoverview This file contains the router definitions for internal API endpoints that manage user data for Doggr.
 * These endpoints are used primarily showing new users and marking seen users in the relation table.
 * @author Carter VanHaren
 */

import express from "express";
import { supabase } from "../utils/supabaseClient.js";
import matchClosestUsers from "../utils/userMatching.js";
import calculateDistance from "../utils/distanceCalc.js";

const router = express.Router();

/**
 * Get the next user data for the current user and prepare next set of users.
 *
 * How it works:
 * 1. Fetches the UUID from the auth table.
 * 2. Pulls row from userdata table using UUID
 * 3. Pulls row from images table using UUID
 * 4. Pulls row from users table using UUID
 * 5. Pulls row from userdata table using UUID
 * 6. Runs matchClosestUsers to generate next users for future.
 * 7. Calculates the distance from loggin in user to next user.
 * 8. Set OOU counter to 1 or 0 (Out of users)
 * 9. Returns all data.
 *
 * @route GET /get-next-user-data
 * @param {Object} req - The request object.
 * @param {string} req.headers.authorization - The authorization token.
 * @param {Object} res - The response object.
 * @returns {Object} The next user data, including basic info, pictures, and distance.
 */
router.get("/get-next-user-data", async (req, res) => {
  let nextUserUuid = "";
  let nextUserNum = "";
  let userId = "";
  let outofuserstate = 0;
  const accessToken = req.headers.authorization;
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
    try {
      outofuserstate = await matchClosestUsers(userId);
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
  return res.status(200).json({
    userUUID: nextUserUuid,
    userdata: userDataTable,
    pictures: pictureLinks,
    basic: basicInfo,
    distance: distance,
    oou: outofuserstate, //out of users
  });
});

/**
 * Mark the current user as seen, either as a like or dislike.
 *
 * How it works:
 * 1. Fetches the UUID from the auth table
 * 2. Creates record with logged in user's uuid and the viewed profile UUID and the relation type.
 *
 * @route POST /mark-user-seen
 * @param {Object} req - The request object.
 * @param {string} req.body.accessToken - The access token.
 * @param {string} req.body.relation - The relation type (like, dislike, block).
 * @param {Object} res - The response object.
 * @returns {Object} The ID of the next user.
 */
router.post("/mark-user-seen", async (req, res) => {
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

/**
 * Returns user data from all tables data.
 *
 * @route GET /get-user-profile
 * @param {Object} req - The request object.
 * @param {string} req.headers.userid - The user ID.
 * @param {Object} res - The response object.
 * @returns {Object} The user profile data, including basic info, userdata, and pictures.
 */
router.get("/get-user-profile", async (req, res) => {
  const userId = req.headers.userid;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
