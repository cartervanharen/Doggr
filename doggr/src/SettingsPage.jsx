import { useState, useEffect } from "react";
import axios from "axios";
import "./global.css";
import { AiFillHome } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";

const SettingsPage = () => {
  const emojis = "🎾🐾🐕‍🦺🥳🤗🤪".split(" ");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dogName, setDogName] = useState("");
  const [address, setAddress] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
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

  return (
    <div className="RootofRoot_MainPage">
      <button className="LeftMenuBar_MainPage">
        <IoSettings size={35} className="HomeIcon_MainPage" />
        <div>PASS</div>
      </button>
      <div className="Whole_MainPage">
        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
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
        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <h1>Location</h1>
          <p>{Array(18).fill("Dog ").join("")}</p>
        </div>
        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <h1>Filters</h1>
          <p>{Array(18).fill("Dog ").join("")}</p>
        </div>
        <div className="EmojiCard_MainPage BorderRadius10px_MainPage">
          {emojis.map((emoji, index) => (
            <span key={index} className="Emojis_MainPage">
              {emoji}
            </span>
          ))}
        </div>
      </div>
      <button className="RightMenuBar_MainPage">
        <AiFillHome size={35} className="HomeButton_MainPage" />
        <div>LIKE</div>
      </button>
    </div>
  );
};

export default SettingsPage;
