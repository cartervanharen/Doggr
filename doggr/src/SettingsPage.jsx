import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./global.css";
import TraitModal from "./TraitModal.jsx";
import FilterModal from "./filters.jsx";
import ImageUpload from "./ImageUpload.jsx";
import LeftSidebar from "./LeftSidebar.jsx";
import RightSidebar from "./RightSidebar.jsx";
import {
  Button,
  Box,
  TextareaAutosize,
  Typography,
  Slider,
  TextField,
} from "@mui/material";
import ShowProfileByUUID from "./ShowProfileByUUID.jsx";

const SettingsPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dogName, setDogName] = useState("");
  const [address, setAddress] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [maxDistance, setMaxDistance] = useState(5);
  const [bio, setBio] = useState("");
  const [bioEditMode, setBioEditMode] = useState(false);
  const navigate = useNavigate();
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
      console.log(userId);
    } catch (error) {
      console.error(
        "Error verifying token:",
        error.response ? error.response.data : error.message
      );
      navigate("/login");
    }
  };

  const fetchLocation = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found in local storage.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/get-location", {
        accessToken: token,
      });
      const { latitude, longitude } = response.data;
      console.log(
        `Location fetched: Latitude ${latitude}, Longitude ${longitude}`
      );
    } catch (error) {
      console.error(
        "Error fetching location:",
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : error.message
      );
    }
  };

  const saveMaxDistance = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found in local storage.");
      navigate("/login");
      return;
    }
    try {
      await axios.post("http://localhost:3000/update-max-distance", {
        accessToken: token,
        maxDistance,
      });
      console.log("Max distance updated successfully.");
    } catch (error) {
      console.error(
        "Error updating max distance:",
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : error.message
      );
    }
  };
  useEffect(() => {
    verifyTokenAndGetUserID();
    fetchBio();
  }, []); //[] are needed to it doesn't run on every keystroke
  useEffect(() => {
    const fetchMaxDistance = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in local storage.");
        return;
      }
      try {
        const response = await axios.post(
          "http://localhost:3000/max-distance",
          {
            accessToken: token,
          }
        );
        setMaxDistance(response.data.maxDistance);
      } catch (error) {
        console.error("Error fetching max distance:", error.message);
      }
    };
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in local storage.");
        return;
      }
      try {
        const response = await axios.post("http://localhost:3000/user-info", {
          accessToken: token,
        });
        const userData = response.data.user;
        setFirstName(userData.human_first_name);
        setLastName(userData.human_last_name);
        setDogName(userData.dog_name);
        setAddress(userData.address);
      } catch (error) {
        console.error("Error fetching user information:", error.message);
      }
    };
    fetchMaxDistance();
    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in local storage.");
        return;
      }
      const updatedUserInfo = {
        accessToken: token,
        firstName,
        lastName,
        dogName,
        address,
      };
      const response = await axios.post(
        "http://localhost:3000/update-user-info",
        updatedUserInfo
      );
      console.log(
        "User information updated successfully:",
        response.data.message
      );
      setEditMode(false);
    } catch (error) {
      console.error("Error updating user information:", error.message);
    }

    fetchLocation();
  };
  const fetchBio = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found in local storage.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/get-bio", {
        accessToken: token,
      });
      setBio(response.data.bio);
    } catch (error) {
      console.error("Error fetching bio:", error.message);
    }
  };
  const updateBio = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found in local storage.");
      return;
    }
    try {
      await axios.post("http://localhost:3000/update-bio", {
        accessToken: token,
        bio,
      });
      console.log("Bio updated successfully.");
      setBioEditMode(false);
    } catch (error) {
      console.error("Error updating bio:", error.message);
    }
  };
  const handleSliderChange = (event, newValue) => {
    setMaxDistance(newValue);
  };

  return (
    <div className="RootofRoot_MainPage">
      <LeftSidebar></LeftSidebar>
      {/* <ShowProfileByUUID></ShowProfileByUUID> */}

      <div className="Whole_SettingsPage">

        
        <div className="generalInfo_SettingsPage BorderRadius10px_MainPage">
          <div className="UserInfo_SettingsPage">
            <div className="UserInput_SettingsPage">
              <h2>General Info</h2>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  margin: "20px",
                }}
              >
                <TextField
                  label="First Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  disabled={!editMode}
                />
                <TextField
                  label="Last Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  disabled={!editMode}
                />
                <TextField
                  label="Dog's Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  placeholder="Dog's Name"
                  disabled={!editMode}
                />
                <TextField
                  label="Full Home Address"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full Home Address"
                  disabled={!editMode}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  {!editMode ? (
                    <Button
                      variant="outlined"
                      onClick={handleEdit}
                      size="small"
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      size="small"
                      color="primary"
                    >
                      Save
                    </Button>
                  )}
                </Box>
              </Box>
            </div>
          </div>
        </div>

        <div className="bio_SettingsPage BorderRadius10px_MainPage">
          <h2>About My Dog</h2>
      <Box
        sx={{
          backgroundColor: 'white',
          zIndex: 3000000,
          margin: '10px',
          padding: '10px',
          borderRadius: '10px'
        }}
      >
        <TextField
          multiline
          rows={3}
          fullWidth

          variant="outlined"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={!bioEditMode}
          maxLength={180}
          inputProps={{

            style: { height: '48px', overflow: 'auto' },
            maxLength: 180 
          }}
          
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',

            marginTop: '10px',
          }}
        >
          {!bioEditMode ? (
            <Button
              variant="outlined"
              onClick={() => setBioEditMode(true)}
              size="small"
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={updateBio}
              color="primary"
              size="small"
            >
              Save
            </Button>
          )}
        </Box>

    </Box>


          
        </div>

        <div className="Distance_SettingsPage BorderRadius10px_MainPage">
          <h2>Dog Radius</h2>
          <Box sx={{ width: "80%", margin: "10px auto" }}>
            <Typography gutterBottom>
              Select the max distance of dog you want to see.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Slider
                sx={{ flexGrow: 1 }}
                value={typeof maxDistance === "number" ? maxDistance : 0}
                onChange={handleSliderChange}
                aria-labelledby="input-slider"
                min={1}
                max={100}
              />
              <Typography variant="h6">{maxDistance} Miles</Typography>
            </Box>
            <Button variant="outlined" onClick={saveMaxDistance}>
              Save
            </Button>
          </Box>
        </div>

        <div className="picture_SettingsPage BorderRadius10px_MainPage">
          <ImageUpload></ImageUpload>
        </div>

        <div className="shortBox_SettingsPage BorderRadius10px_MainPage">
          <h2>User Filtering</h2>

          <FilterModal />
        </div>
        <div className="shortBox_SettingsPage BorderRadius10px_MainPage">
          <h2>Trait Evaluation</h2>

          <TraitModal></TraitModal>
        </div>
      </div>
      <RightSidebar></RightSidebar>
    </div>
  );
};
export default SettingsPage;
