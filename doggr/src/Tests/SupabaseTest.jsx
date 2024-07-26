import axios from "axios";
async function SupabaseTest() {
  try {
    const response = await axios.get(
      `http://localhost:3000/get-all-users`
    );
    response
    return ["SupaBase Operational", "Passing"];
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    return ["SUPABASE ERROR:" + errorMessage, "Failed"];
  }
}
export default SupabaseTest;

