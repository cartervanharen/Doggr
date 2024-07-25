import axios from "axios";
const UpdateInfoTest = async ({ token }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/update-max-distance",
      {
        accessToken: token,
        maxDistance: 50,
      }
    );
    return [response.data.message, "Passing"];
  } catch (error) {
    throw new Error(error.response?.data?.message || error);
  }
};
export default UpdateInfoTest;
