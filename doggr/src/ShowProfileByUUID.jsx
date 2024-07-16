import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

function ShowProfilebyUUID() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await verifyTokenAndGetUserID();
        const data = await getNextUser();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const verifyTokenAndGetUserID = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
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
      console.log("User ID:", userId);
    } catch (error) {
      console.error(
        "Error verifying token:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  const getNextUser = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        "http://localhost:3000/next-user-data",
        {
          accessToken: token,
        }
      );

      console.log("Next user data:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching next user data:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  if (!userData) {
    return (
      <Box
        className="loadingPage"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={300} sx={{ color: "white" }} />
      </Box>
    );
  }

  const {
    basic: { human_first_name, human_last_name, dog_name, address },
    userdata: {
      bio,
      likeability,
      energy,
      playfulness,
      aggression,
      size,
      training,
    },
    pictures: { picture1, picture2, picture3, picture4, picture5 },
  } = userData;

  const renderLevelBar = (label, value) => {
    return (
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            {label}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {value}
          </Typography>
        </Box>
        <LinearProgress
          sx={{ height: 10, borderRadius: 5 }}
          variant="determinate"
          value={(value / 10) * 100}
        />
      </Box>
    );
  };

  return (
    <div className="Whole_ShowProfile">
      <div className="DogImageCard_ShowProfile">
        <img src={picture1} id="MainDogImage_ShowProfile" alt="Dog 1" />
        <div className="SmallDogImageGrid_MainPage">
          <img
            src={picture2}
            className="SmallDogImage_ShowProfile"
            alt="Dog 2"
          />
          <img
            src={picture3}
            className="SmallDogImage_ShowProfile"
            alt="Dog 3"
          />
          <img
            src={picture4}
            className="SmallDogImage_ShowProfile"
            alt="Dog 4"
          />
          <img
            src={picture5}
            className="SmallDogImage_ShowProfile"
            alt="Dog 5"
          />
        </div>
      </div>

      <div className="BioCard_ShowProfile">
        <h1 className="Header_ShowProfile">{dog_name}</h1>
        <p className="Paragraph_ShowProfile">{bio}</p>
      </div>

      <div className="Levels_ShowProfile">
        <div className="profile-container">
          {renderLevelBar("Size", size)}
          {renderLevelBar("Training", training)}
          {renderLevelBar("Likeability", likeability)}
          {renderLevelBar("Energy", energy)}
          {renderLevelBar("Playfulness", playfulness)}
          {renderLevelBar("Aggression", aggression)}
        </div>
      </div>
    </div>
  );
}

export default ShowProfilebyUUID;
