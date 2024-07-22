/**
 *         ____
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /
 *     /_____/  \____/  \__, /   \__, /  /_/
 *                     /____/   /____/
 *
 * @fileoverview This file contains the authentication routes for Doggr. It includes
 * routes for signing in users and verifying authentication tokens. These endpoints facilitate
 * secure access and identity verification for users.
 * @author Carter VanHaren
 */

import express from "express";
import { supabase } from "../utils/supabaseClient.js";
const router = express.Router();

/**
 * Signs in a user using their email and password.
 * It validates user credentials against the Supabase Auth service and returns user session data on success.
 * @route POST /signin
 * @param {Object} req.body - Contains the email and password for authentication.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @returns {Object} JSON - Includes a message indicating successful login along with user and session data.
 * @returns {Error} 400 - Indicates that the email and/or password were not provided.
 * @returns {Error} 401 - Indicates unauthorized access, usually due to invalid credentials.
 */
router.post("/signin", async (req, res) => {
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

/**
 * Verifies an authentication token to confirm a user's identity.
 * This route checks the validity of the provided token using Supabase's Auth API and returns user information if valid.
 * @route POST /verify-token
 * @param {string} req.body.authorization - Authorization header containing the Bearer token.
 * @returns {Object} JSON - Contains a message that the token is valid along with the user data.
 * @returns {Error} 403 - Indicates that the token was not provided.
 * @returns {Error} 401 - Indicates an invalid token or that the token has expired.
 */
router.post("/verify-token", async (req, res) => {
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

export default router;
