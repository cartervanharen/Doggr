/**
 *         ____
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /
 *     /_____/  \____/  \__, /   \__, /  /_/
 *                     /____/   /____/
 *
 * @fileoverview This file contains the communication and matching routes for Doggr.
 * It facilitates interactions between users through messages between those who have liked each other.
 * Users can send messages to each other, retrieve message histories, and find matches recorded in the relation table.
 * @author Carter VanHaren
 */

import express from "express";
import { supabase } from "../utils/supabaseClient.js";
const router = express.Router();

/**
 * Fetches messages between two users, identified by their UUIDs.
 * It retrieves all messages where the participants are either the sender or recipient,
 * ensuring that all relevant conversations are fetched.
 * @route GET /messages
 * @param {string} req.query.user_from - UUID of the user sending the message.
 * @param {string} req.query.user_to - UUID of the user receiving the message.
 * @returns {Object[]} data - Array of messages between the specified users.
 * @returns {Error} 500 - Internal server error if there is a problem fetching messages.
 */
router.get("/messages", async (req, res) => {
  const { user_from, user_to } = req.query;
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `user_from.eq.${user_from},user_to.eq.${user_to},user_from.eq.${user_to},user_to.eq.${user_from}`
      )
      .order("time_sent", { ascending: true });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error occurred." });
  }
});

/**
 * Sends a message from one user to another. This route inserts a message record into the database,
 * capturing the sender, recipient, message content, and time sent.
 * @route POST /send-message
 * @param {string} req.body.user_from - UUID of the user sending the message.
 * @param {string} req.body.user_to - UUID of the user receiving the message.
 * @param {string} req.body.text - Content of the message.
 * @returns {Object} data - Details of the message that was sent.
 * @returns {Error} 500 - Internal server error if the message could not be sent.
 */
router.post("/send-message", async (req, res) => {
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
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Finds mutual likes between users to identify potential matches. This function checks both
 * sent and received likes to determine mutual interest before fetching and returning details
 * of the matched users.
 *
 * How it works:
 * 1. Fetches all relation table entries that the logged in user has sent
 * 2. Fetches all relation table entires that have been sent to the logged in user
 * 3. Find matches and return list.
 *
 * @route POST /find-matches
 * @param {string} req.body.accessToken - Access token to authenticate the user.
 * @returns {Object[]} matches - Array of user profiles who have mutual likes with the requester.
 * @returns {string} message - A message indicating no matches found if applicable.
 * @returns {Error} 400 - Access token is required but was not provided.
 * @returns {Error} 404 - User not found if the access token does not match any user.
 * @returns {Error} 500 - Internal server error for other errors.
 */
router.post("/find-matches", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required." });
  }
  try {
    const { data: user, error: userError } = await supabase.auth.api.getUser(
      accessToken
    );
    if (userError || !user) {
      return res.status(404).json({ error: "User not found." });
    }
    const uuid = user.id;
    const { data: likesSent, error: likesSentError } = await supabase
      .from("relation")
      .select("user_to")
      .eq("user_from", uuid)
      .eq("type", 1);
    if (likesSentError) {
      throw likesSentError;
    }
    const { data: likesReceived, error: likesReceivedError } = await supabase
      .from("relation")
      .select("user_from")
      .eq("user_to", uuid)
      .eq("type", 1);
    if (likesReceivedError) {
      throw likesReceivedError;
    }
    const sentUUIDs = new Set(likesSent.map((like) => like.user_to));
    const receivedUUIDs = new Set(likesReceived.map((like) => like.user_from));
    const mutualLikes = [...sentUUIDs].filter((userTo) =>
      receivedUUIDs.has(userTo)
    );
    if (mutualLikes.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(
          "uuid, human_first_name, human_last_name, address, dog_name, created_at, last_active, user_level"
        )
        .in("uuid", mutualLikes);
      if (usersError) {
        throw usersError;
      }
      const picturePromises = mutualLikes.map((userId) =>
        supabase.from("images").select("picture1").eq("uuid", userId).single()
      );
      const picturesResults = await Promise.all(picturePromises);
      const pictureData = picturesResults.reduce((acc, result, index) => {
        if (!result.error) {
          acc[mutualLikes[index]] = result.data.picture1;
        }
        return acc;
      }, {});
      const matches = usersData.map((user) => ({
        ...user,
        picture1: pictureData[user.uuid] || "Default image URL or null if none",
      }));
      return res.status(200).json({ matches });
    } else {
      return res
        .status(200)
        .json({ message: "No matches found.", matches: [] });
    }
  } catch (error) {
    console.error("Error finding matches:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
