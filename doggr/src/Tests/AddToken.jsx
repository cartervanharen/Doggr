import axios from "axios";

async function addToken(userData) {
  try {
    const response = await axios.post("http://localhost:3000/signin", userData);
    console.log(response.data.session.access_token);
    localStorage.removeItem("accessToken");
    localStorage.setItem("accessToken", response.data.session.access_token);
    return ["Access Token: " + response.data.session.access_token, "Passing"];
  } catch (error) {
    console.error(
      "Error signing in user:",
      error.response ? error.response.data : error.message
    );
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;

    return [errorMessage, "Failed"];
  }
}

export default addToken;
