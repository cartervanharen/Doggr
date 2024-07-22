import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./global.css";
import ShowProfileByUUID from "./ShowProfileByUUID.jsx";
import LeftSidebar from "./LeftSidebar.jsx";
import RightSidebar from "./RightSidebar.jsx";
import { Box, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";

const MainPage = () => {
  const navigate = useNavigate();
  const [tiltDirection, setTiltDirection] = useState("");
  const [profileKey, setProfileKey] = useState(0);

  const verifyTokenAndGetUserID = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
    console.log(wholeToken);
    if (!token) {
      console.error("No token found in local storage.");
      navigate("/settings");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/verify-token", {
        authorization: wholeToken,
      });
      const userId = response.data.user.id;
      console.log("User ID retrieved:", userId);
      return userId;
    } catch (error) {
      console.error(
        "Error verifying token:",
        error.response ? error.response.data : error.message
      );
      navigate("/settings");
    }
  };

  const refreshUsers = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
    console.log(wholeToken);
    if (!token) {
      console.error("No token found in local storage.");
      navigate("/settings");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/verify-token", {
        authorization: wholeToken,
      });
      const userId = response.data.user.id;
      console.log("User ID retrieved:", userId);

      const responseUsers = await axios.post(
        "http://localhost:3000/verify-token",
        {
          userid: userId,
        }
      );
      console.log("Users Refreshed:", userId);
      return responseUsers;
    } catch (error) {
      console.error(
        "Error verifying token:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    verifyTokenAndGetUserID();
  }, []);

  const handleHoverEnter = (direction) => {
    setTiltDirection(direction);
  };

  const handleHoverLeave = () => {
    setTiltDirection("");
  };

  const likeclick = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        "http://localhost:3000/mark-user-seen",
        {
          accessToken: token,
          relation: "like",
        }
      );
      const userId = response.data.id;
      console.log("usersendlikeform:", userId);

      setProfileKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error(
        "error liking:",
        error.response ? error.response.data : error.message
      );
    }

    handleHoverLeave();
  };

  const dislikeclick = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        "http://localhost:3000/mark-user-seen",
        {
          accessToken: token,
          relation: "dislike",
        }
      );
      const userId = response.data.id;
      console.log("usersendlikeform:", userId);

      setProfileKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error(
        "error liking:",
        error.response ? error.response.data : error.message
      );
    }
    handleHoverLeave();
  };

  const tiltStyles = {
    transform:
      tiltDirection === "left"
        ? "rotate(-5deg)"
        : tiltDirection === "right"
        ? "rotate(5deg)"
        : "none",
    transition: "transform 1s ease-in-out, box-shadow 0.5s ease-in-out",
  };

  const getBackgroundClass = () => {
    switch (tiltDirection) {
      case "left":
        return "transition-left";
      case "right":
        return "transition-right";
      default:
        return "transition-none";
    }
  };

  return (
    <>
      <div className={`RootofRoot_MainPage ${getBackgroundClass()}`}>
        <div className="flexbox_MainPage">
          <LeftSidebar />
          <div style={tiltStyles}>
            <ShowProfileByUUID key={profileKey} />
          </div>
          <RightSidebar />
        </div>
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: 0,
            right: 0,
            zIndex: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            startIcon={<CloseIcon />}
            color="primary"
            sx={{
              minWidth: 200,
              height: 60,
              marginX: 1,
              background: "red",
              border: "10px solid black",
              boxSizing: "content-box",
              borderRadius: 10,
            }}
            onMouseEnter={() => handleHoverEnter("left")}
            onMouseLeave={handleHoverLeave}
            onClick={dislikeclick}
          >
            Pass
          </Button>

          <img
            src="https://i.ibb.co/xmGGCQY/doggr.jpg"
            alt="Logo"
            style={{
              width: 100,
              height: 100,
              marginX: 1,
              borderRadius: 90,
              margin: -10,
              border: "10px solid black",
              boxSizing: "content-box",
            }}
            className="spin-on-hover"
          />

          <Button
            variant="contained"
            endIcon={<FavoriteIcon />}
            color="primary"
            sx={{
              minWidth: 200,
              height: 60,
              background: "#00A651",
              marginX: 1,
              border: "10px solid black",
              boxSizing: "content-box",
              borderRadius: 10,
            }}
            onMouseEnter={() => handleHoverEnter("right")}
            onMouseLeave={handleHoverLeave}
            onClick={likeclick}
          >
            Like
          </Button>
          <Box />
        </Box>
        <div className="rectangle"></div>
      </div>
    </>
  );
};

export default MainPage;
