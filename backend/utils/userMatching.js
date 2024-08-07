/**
 *         ____
 *        / __ \  ____    ____ _   ____ _   _____
 *       / / / / / __ \  / __ `/  / __ `/  / ___/
 *      / /_/ / / /_/ / / /_/ /  / /_/ /  / /
 *     /_____/  \____/  \__, /   \__, /  /_/
 *                     /____/   /____/
 *
 * @fileoverview This file contains the function that generates new suggestions for the next users to show the logged-in user by-
 * fetching user data, filtering potential matches, and accessing a neural network for personalized recommendations.
 * The function interacts with Supabase for database operations and a Flask server for trait prediction.

 * Author: Carter VanHaren
 */

import { supabase } from './supabaseClient.js';
import calculateDistance from './distanceCalc.js';

/**
 * Generates new suggestions for the next users to show to the logged-in user.
 * This function fetches the current user's data, predicts traits, filters out seen users,
 * and sorts potential matches based on proximity and similarity of traits.
 * It then updates the `nextusers` table with the closest matching users.
 * 
 * How it works:
 * 1. Fetches current user data based on the providede UUID.
 * 2. Fetches all relation records of those whose user_from matches the UUID (indicating that this user has already been seen before). 
 * 3. Filters users out that have been seen already.
 * 4. Filters users out thast are outside the distance radius.
 * 5. Filters users out based on manual trait filters.
 * 6. Send the current users traits to the ML running on the flask server to find predicted traits.
 * 7. Match the top 10 closes users to the predicted users.
 * 8. Update users in the nextuser table.
 * 
 * @param {string} uuid - The UUID of the current user.
 * @returns {Promise<number>} - Returns 0 if new users are found, 1 if no new users are available.
 * @throws {Error} - Throws an error if the UUID is not provided, or if there are issues fetching data or updating the database.
 * 
 * @async
 * @function
 */
async function matchClosestUsers(uuid) {
  let outofusers = 0;
  if (!uuid) {
    throw new Error("UUID is required");
  }
  const { data: currentUserData, error: currentUserDataError } = await supabase
    .from("userdata")
    .select(
      "latitude, longitude, maxDistance, likeability, energy, playfulness, aggression, size, training, likeabilityFilter, energyFilter, playfulnessFilter, aggressionFilter, sizeFilter, trainingFilter"
    )
    .eq("uuid", uuid)
    .single();
  if (currentUserDataError) {
    throw new Error(
      `Error fetching current user data: ${currentUserDataError.message}`
    );
  }
  const predictedTraitsResponse = await fetch(
    `http://localhost:3001/predict?trait1=${currentUserData.likeability}&trait2=${currentUserData.energy}&trait3=${currentUserData.playfulness}&trait4=${currentUserData.aggression}&trait5=${currentUserData.size}&trait6=${currentUserData.training}`
  );
  const predictedTraits = await predictedTraitsResponse.json();
  const { data: relations, error: relationsError } = await supabase
    .from("relation")
    .select("user_to, user_from")
    .or(`user_from.eq.${uuid},user_to.eq.${uuid}`);
  if (relationsError) {
    throw new Error(`Error fetching relations: ${relationsError.message}`);
  }
  const seenUserIds = new Set(
    relations.map((relation) =>
      relation.user_from === uuid ? relation.user_to : relation.user_from
    )
  );
  const { data: allUsers, error: allUsersError } = await supabase
    .from("userdata")       
    .select("*")
    .not("uuid", "eq", uuid);
  if (allUsersError) {
    throw new Error(`Error fetching all users: ${allUsersError.message}`);
  }
  const filteredAndSortedUsers = allUsers
    .filter((user) => {
      const distance = calculateDistance(
        currentUserData.latitude,
        currentUserData.longitude,
        user.latitude,
        user.longitude
      );
      return (
        !seenUserIds.has(user.uuid) &&
        distance <= currentUserData.maxDistance &&
        [
          "likeability",
          "energy",
          "playfulness",
          "aggression",
          "size",
          "training",
        ].every((trait) => {
          const filter = currentUserData[`${trait}Filter`];
          if (filter) {
            return user[trait] >= filter.min && user[trait] <= filter.max;
          }
          return true;
        })
      );
    })
    .sort((a, b) => {
      const scoreA = predictedTraits.predicted_traits.reduce(
        (acc, trait, index) => {
          acc += Math.abs(trait - a[`trait${index + 1}`]);
          return acc;
        },
        0
      );
      const scoreB = predictedTraits.predicted_traits.reduce(
        (acc, trait, index) => {
          acc += Math.abs(trait - b[`trait${index + 1}`]);
          return acc;
        },
        0
      );
      return scoreA - scoreB;
    })
    .slice(0, 10);
  if (filteredAndSortedUsers.length === 0) {
    outofusers = 1;
    return outofusers;
  }
  const upsertData = {
    uuid: uuid,
    nextuser: 1,
  };
  for (let i = 1; i <= 10; i++) {
    upsertData[`user${i}`] = filteredAndSortedUsers[i - 1]
      ? filteredAndSortedUsers[i - 1].uuid
      : null;
  }
  const { error: updateError } = await supabase
    .from("nextusers")
    .upsert(upsertData, { returning: "minimal" });
  if (updateError) {
    throw new Error(`Error updating next users: ${updateError.message}`);
  }
  return outofusers;
}

export default matchClosestUsers;
