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
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import MessageIcon from "@mui/icons-material/Message";
import LogoutIcon from "@mui/icons-material/Logout";

function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSelected = (path) => location.pathname === path;

  function logout() {
    localStorage.removeItem("accessToken");
    window.location.reload();
  }
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: 300, boxSizing: "border-box" },
        "& .MuiListItemIcon-root": { minWidth: 40 },
        "& .MuiTypography-root": { fontSize: "1.7rem" },
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
              sx={{ color: isSelected(item.path) ? "primary.main" : "inherit" }}
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
          <Avatar src="https://via.placeholder.com/40" sx={{ mr: 2 }} />
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
  );
}

export default LeftSidebar;
