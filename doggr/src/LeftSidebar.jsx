import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Button,
  Avatar,
  Modal,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import ProfileView from "./ProfileView.jsx";

function LeftSidebar() {
  const [pfpUrl, setPfpUrl] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !userId) {
      console.log("No access token or user ID found");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/user-profile", {
        userId,
        accessToken: token,
      });
      setUserData(response.data);
      console.log("User Data fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  useEffect(() => {
    const fetchPfp = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("No access token found");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/get-dog-pictures",
          { headers: { Authorization: token } }
        );
        const firstImage = response.data.images[0];
        if (firstImage && firstImage.picture1) {
          setPfpUrl(firstImage.picture1);
        } else {
          console.log("No profile picture available");
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    const fetchUserId = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("No access token found");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/verify-token",
          { authorization: "Bearer " + token }
        );
        setUserId(response.data.user.id);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchPfp();
    fetchUserId();
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const isSelected = (path) => location.pathname === path;

  const handleOpenProfileModal = async () => {
    await fetchUserProfile();
    setProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
  };

  function logout() {
    localStorage.removeItem("accessToken");
    navigate("/login");
    window.location.reload();
  }

  return (
    <>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 300, boxSizing: "border-box" },
          "& .MuiListItemIcon-root": { minWidth: 40 },
          "& .MuiTypography-root": { fontSize: "1.2rem" },
        }}
      >
        <List>
          {[
            { text: "Home", icon: <HomeIcon fontSize="large" />, path: "/" },
            {
              text: "Settings",
              icon: <SettingsIcon fontSize="large" />,
              path: "/settings",
            },
            {
              text: "Matches",
              icon: <FavoriteIcon fontSize="large" />,
              path: "/messages",
            },
          ].map((item, index) => (
            <ListItem
              button
              key={index}
              onClick={() => navigate(item.path)}
              selected={isSelected(item.path)}
            >
              <ListItemIcon
                sx={{
                  color: isSelected(item.path) ? "primary.main" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, mt: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar src={pfpUrl} sx={{ mr: 2 }} />
            <Typography variant="subtitle1">
              {userData?.basic?.dog_name}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleOpenProfileModal}
            sx={{ mb: 2 }}
          >
            View Profile
          </Button>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={() => logout()}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Modal open={profileModalOpen} onClose={handleCloseProfileModal}>
        <Box
          sx={{
            bgcolor: "white",
            p: 2,
            height: "800px",
            width: "800px",
            margin: "auto",
            marginTop: "40px",
            justifyContent: "center",
            padding: "4px",
          }}
        >
          {userData ? (
            <ProfileView userData={userData} />
          ) : (
            <Typography variant="h6">Loading...</Typography>
          )}
        </Box>
      </Modal>
    </>
  );
}

export default LeftSidebar;
