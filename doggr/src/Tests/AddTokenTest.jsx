import axios from "axios";
async function addToken(userData) {
  try {
    const response = await axios.post("http://localhost:3000/signin", userData);
    localStorage.removeItem("accessToken");
    localStorage.setItem("accessToken", response.data.session.access_token);
    return ["Access Token: " + response.data.session.access_token, "Passing"];
  } catch (error) {

    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    return ["SIGN-IN ERROR: " + errorMessage, "Failed"];
  }
}
export default addToken;
