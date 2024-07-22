/** 
 *         ____                                  
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /    
 *     /_____/  \____/  \__, /   \__, /  /_/     
 *                     /____/   /____/           
 *
 * @fileoverview This file contains the router definitions for internal API endpoints that manage user data for Doggr.
 * These endpoints are used primarily for administrative tasks such as managing user accounts, interactions, and testing.
 * These routes are intended for use by system administrators and should ideally be protected by appropriate authentication mechanisms.
 * @author Carter VanHaren
 */

import express from "express";
import { supabase } from "../utils/supabaseClient.js";
const router = express.Router();
