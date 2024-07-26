import { useState, useEffect } from "react";
import axios from "axios";
import "./global.css";
import TraitModal from "./TraitModal.jsx";
import FilterModal from "./filters.jsx";
import ImageUpload from "./ImageUpload.jsx";
import LeftSidebar from "./LeftSidebar.jsx";
import RightSidebar from "./RightSidebar.jsx";
import { Button, Box, Typography, Slider, TextField } from "@mui/material";

const SettingsPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dogName, setDogName] = useState("");
  const [address, setAddress] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [maxDistance, setMaxDistance] = useState(5);
  const [bio, setBio] = useState("");
  const [bioEditMode, setBioEditMode] = useState(false);
  const verifyTokenAndGetUserID = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
    if (!token) {
      return;
    }

    const response = await axios.post("http://localhost:3000/verify-token", {
      authorization: wholeToken,
    });
    const userId = response.data.user.id;
  };

  const refreshUsers = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
    if (!token) {
      return;
    }

    const response = await axios.post("http://localhost:3000/verify-token", {
      authorization: wholeToken,
    });
    const userId = response.data.user.id;

    const responseUsers = await axios.post(
      "http://localhost:3000/generate-new-nextusers",
      {
        userid: userId,
      }
    );
    return responseUsers;
  };

  const fetchLocation = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    try {
      const response = await axios.get("http://localhost:3000/get-location", {
        headers: { Authorization: token },
      });
      const { latitude, longitude } = response.data;
    } catch (error) {
      error;
    }
  };

  const saveMaxDistance = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    await axios.post("http://localhost:3000/update-max-distance", {
      accessToken: token,
      maxDistance,
    });

    refreshUsers();
  };
  useEffect(() => {
    verifyTokenAndGetUserID();
    fetchBio();
  }, []);

  useEffect(() => {
    const fetchMaxDistance = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }
      const response = await axios.get(
        "http://localhost:3000/get-max-distance",
        {
          headers: { Authorization: token },
        }
      );
      setMaxDistance(response.data.maxDistance);
    };
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      const response = await axios.get("http://localhost:3000/get-user-info", {
        headers: { Authorization: token },
      });
      const userData = response.data.user;
      setFirstName(userData.human_first_name);
      setLastName(userData.human_last_name);
      setDogName(userData.dog_name);
      setAddress(userData.address);
    };
    fetchMaxDistance();
    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };
  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
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

    fetchLocation();
    refreshUsers();

    setEditMode(false);
  };
  const fetchBio = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    const response = await axios.get("http://localhost:3000/get-bio", {
      headers: { Authorization: token },
    });
    setBio(response.data.bio);
  };
  const updateBio = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    await axios.post("http://localhost:3000/update-bio", {
      accessToken: token,
      bio,
    });
    setBioEditMode(false);
  };
  const handleSliderChange = (event, newValue) => {
    setMaxDistance(newValue);
  };

  return (
    <div className="RootofRoot_MainPage">
      <LeftSidebar></LeftSidebar>

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
              backgroundColor: "white",
              zIndex: 3000000,
              margin: "10px",
              padding: "10px",
              borderRadius: "10px",
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
                style: { height: "48px", overflow: "auto" },
                maxLength: 180,
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",

                marginTop: "10px",
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
