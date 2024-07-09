import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./global.css";
import ShowProfileByUUID from "./ShowProfileByUUID.jsx";

const MainPage = () => {
  const navigate = useNavigate();

  const verifyTokenAndGetUserID = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
    console.log(wholeToken);
    if (!token) {
      console.error("No token found in local storage.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/verify-token", {
        authorization: wholeToken,
      });

      const userId = response.data.user.id;
      console.log("User ID retrieved:", userId);
    } catch (error) {
      console.error(
        "Error verifying token:",
        error.response ? error.response.data : error.message
      );
      navigate("/login");
    }
  };

  useEffect(() => {
    verifyTokenAndGetUserID();
  });

  return <ShowProfileByUUID></ShowProfileByUUID>;
};

export default MainPage;
