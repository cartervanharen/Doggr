import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./global.css";
import TraitModal from "./TraitModal.jsx";
import FilterModal from "./filters.jsx";
import ImageUpload from "./ImageUpload.jsx";
import LeftSidebar from "./LeftSidebar.jsx";
import RightSidebar from "./RightSidebar.jsx";
import { Button, TextField, Slider, Box, Typography, TextareaAutosize } from '@mui/material';
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
        accessToken: token
      });
      const { latitude, longitude } = response.data;
      console.log(`Location fetched: Latitude ${latitude}, Longitude ${longitude}`);
      // Update state or perform further actions with the location data
    } catch (error) {
      console.error(
        "Error fetching location:",
        error.response ? JSON.stringify(error.response.data, null, 2) : error.message
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
    fetchLocation();
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

  return (
    <div className="RootofRoot_MainPage">
      <LeftSidebar></LeftSidebar>
      {/* <ShowProfileByUUID></ShowProfileByUUID> */}

      <div className="Whole_SettingsPage">
        <div className="generalInfo_SettingsPage BorderRadius10px_MainPage">
          <div className="UserInfo_SettingsPage">
            <div className="UserInput_SettingsPage">
              <h1>General Info</h1>
              <input
                className="InputField_SettingsPage"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                disabled={!editMode}
              />
              <input
                className="InputField_SettingsPage"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                disabled={!editMode}
              />
              <input
                className="InputField_SettingsPage"
                type="text"
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
                placeholder="Dog's Name"
                disabled={!editMode}
              />
              <input
                className="InputField_SettingsPage"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full Home Address"
                disabled={!editMode}
              />
              <div className="EditButtons__SettingsPage">
                {!editMode && (
                  <button
                    className="InputField_SettingsPage"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                )}
                {editMode && (
                  <button
                    className="InputField_SettingsPage"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="UserFilters_SettingsPage BorderRadius10px_MainPage">
          <FilterModal></FilterModal>
        </div>
        <div className="traits_SettingsPage BorderRadius10px_MainPage">
          <TraitModal></TraitModal>
        </div>
        <div className="Distance_SettingsPage BorderRadius10px_MainPage">
          <h1>Range</h1>
          <p>Select the max distance of users.</p>
          <div className="RangeSlider_SettingsPage">
            <div className="InnerFlexDistance_SettingsPage">
              <input
                className="SliderInnerFlexDistance_SettingsPage"
                type="range"
                min="1"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
              />
              <h2> {maxDistance} Miles</h2>
            </div>
            <button
              className="InputField_SettingsPage"
              onClick={saveMaxDistance}
            >
              Save
            </button>
          </div>
        </div>
        <div className="traits_SettingsPage BorderRadius10px_MainPage">
          <h3>Profile Pictures</h3>
          <ImageUpload></ImageUpload>
        </div>
        <div className="Distance_SettingsPage BorderRadius10px_MainPage">
          <h1>Bio</h1>
          <textarea 
            className="BioField_SettingsPage"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!bioEditMode}
          />
          <div className="EditButtons__SettingsPage">
            {!bioEditMode ? (
              <button
                className="InputField_SettingsPage"
                onClick={() => setBioEditMode(true)}
              >
                Edit
              </button>
            ) : (
              <button className="InputField_SettingsPage" onClick={updateBio}>
                Save
              </button>
            )}
          </div>
        </div>
      </div>
      <RightSidebar></RightSidebar>
    </div>
  );
};
export default SettingsPage;
