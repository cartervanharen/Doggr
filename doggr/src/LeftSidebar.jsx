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
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import MessageIcon from "@mui/icons-material/Message";
import LogoutIcon from "@mui/icons-material/Logout";

function LeftSidebar() {
  const [pfpUrl, setpfpUrl] = useState("");
  useEffect(() => {
    const fetchPfp = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("No access token found");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/current-dog-pictures",
          { accessToken: token }
        );
        const firstImage = response.data.images[0];
        if (firstImage && firstImage.picture1) {
          setpfpUrl(firstImage.picture1);
        } else {
          console.log("No profile picture available");
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchPfp();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const isSelected = (path) => location.pathname === path;

  function logout() {
    localStorage.removeItem("accessToken");
    window.location.reload();
  }
  console.log(pfpUrl);
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
              text: "Messages",
              icon: <MessageIcon fontSize="large" />,
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
            <Typography variant="subtitle1">Julio</Typography>
          </Box>
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
    </>
  );
}

export default LeftSidebar;
