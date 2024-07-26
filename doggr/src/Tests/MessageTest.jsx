import axios from "axios";
async function MessageTest() {
  try {
    const response = await axios.get(
      `http://localhost:3000/messages?user_from=da58ef62-ab09-4b6c-8989-23e6a1896904&user_to=ca3afab4-d225-4cbc-b25a-f21854ce980d`
    );
    response
    return ["Messages Received Properly", "Passing"];
  } catch (error) {

    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    return ["MESSAGING ERROR:" + errorMessage, "Failed"];
  }
}
export default MessageTest;

