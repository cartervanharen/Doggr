import axios from "axios";
const generateNextUsers = async ({ token }) => {
  try {
    const uuidGet = await axios.post("http://localhost:3000/verify-token", {
      authorization: "Bearer " + token,
    });
    const response = await axios.post("http://localhost:3000/generate-new-nextusers", {
      userid: uuidGet.data.user.id,
    });
    response
    return ["Success", "Passing"];
  } catch (error) {
    throw new Error(error.response?.data?.message || error);
  }
};
export default generateNextUsers;

