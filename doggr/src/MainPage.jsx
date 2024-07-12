import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./global.css";
import ShowProfileByUUID from "./ShowProfileByUUID.jsx";
import LeftSidebar from "./LeftSidebar.jsx";
import RightSidebar from "./RightSidebar.jsx";
import { Box, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';

const MainPage = () => {
  const navigate = useNavigate();
  const [tiltDirection, setTiltDirection] = useState('');

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

  const handleHoverEnter = (direction) => {
    setTiltDirection(direction);
  };

  const handleHoverLeave = () => {
    setTiltDirection('');
  };

  const tiltStyles = {
    transform: tiltDirection === 'left' ? 'rotate(-5deg)' : tiltDirection === 'right' ? 'rotate(5deg)' : 'none',
    transition: 'transform 0.5s ease-in-out'
  };

  return (
    <>
      <div className="flexbox_MainPage">
        <LeftSidebar></LeftSidebar>
        <div style={tiltStyles}>
          <ShowProfileByUUID></ShowProfileByUUID>
        </div>
        <RightSidebar></RightSidebar>
      </div>

      <Box sx={{ position: 'fixed', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button 
          variant="contained" 
          startIcon={<CloseIcon />} 
          color="error" 
          sx={{ minWidth: 140, height: 60, marginX: 1 }}
          onMouseEnter={() => handleHoverEnter('left')}
          onMouseLeave={handleHoverLeave}
        >
          Dislike
        </Button>
        <Button 
          variant="contained" 
          endIcon={<FavoriteIcon />} 
          color="primary" 
          sx={{ minWidth: 140, height: 60, marginX: 1 }}
          onMouseEnter={() => handleHoverEnter('right')}
          onMouseLeave={handleHoverLeave}
        >
          Like
        </Button>
      </Box>
    </>
  );
};

export default MainPage;
