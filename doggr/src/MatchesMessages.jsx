import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ProfileView from "./ProfileView.jsx";
import LeftSidebar from "./LeftSidebar.jsx";

function MessagingApp() {
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userFrom, setUserFrom] = useState("");
  const [userTo, setUserTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  useEffect(() => {
    fetchUserUUID();
  }, []);

  useEffect(() => {
    if (userFrom) {
      fetchMatches();
    }
  }, [userFrom]);

  useEffect(() => {
    if (userTo) {
      fetchMessages();
      fetchUserProfile(userTo);
    }
    const interval = setInterval(() => {
      if (userTo) {
        fetchMessages(true);
      }
    }, 1000); //message refresh rate
    return () => clearInterval(interval);
  }, [userTo, userFrom]);

  useEffect(() => {
    if (messagesEndRef.current && messages.length > prevMessagesLength) {
      messagesEndRef.current.scrollIntoView();
    }
    setPrevMessagesLength(messages.length);
  }, [messages]);

  const fetchUserUUID = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }
    const wholeToken = "Bearer " + token;

    const response = await axios.post("http://localhost:3000/verify-token", {
      authorization: wholeToken,
    });
    if (response.data && response.data.user) {
      setUserFrom(response.data.user.id);
    }
  };

  const fetchMatches = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.post("http://localhost:3000/find-matches", {
      accessToken,
    });
    setMatches(response.data.matches);
  };

  const fetchMessages = async (isIntervalFetch = false) => {
    if (!userFrom || !userTo) return;

    const response = await axios.get(
      `http://localhost:3000/messages?user_from=${userFrom}&user_to=${userTo}`
    );
    const fetchedMessages = response.data.filter(
      (msg) =>
        (msg.user_from === userFrom && msg.user_to === userTo) ||
        (msg.user_from === userTo && msg.user_to === userFrom)
    );

    if (JSON.stringify(messages) !== JSON.stringify(fetchedMessages)) {
      setMessages(fetchedMessages);
      if (!isIntervalFetch) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }

    setLoading(false);
  };

  const fetchUserProfile = async (userId) => {
    const response = await axios.get("http://localhost:3000/get-user-profile", {
      headers: { userId },
    });
    setUserData(response.data);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim() || !userFrom || !userTo) return;

    await axios.post("http://localhost:3000/send-message", {
      user_from: userFrom,
      user_to: userTo,
      text,
    });
    setText("");
    fetchMessages();
  };

  const handleUserSelection = (uuid) => {
    if (userTo === uuid) {
      fetchUserProfile(uuid);
    } else {
      setUserTo(uuid);
      setMessages([]);
      setLoading(true);
      setUserData(null); // Clear the previous user data
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <LeftSidebar></LeftSidebar>
      <Box sx={{ display: "flex", height: "100vh", marginLeft: "300px" }}>
        <Box sx={{ width: "540px", borderRight: "1px solid #ccc", p: 2 }}>
          <Typography variant="h6">Matches</Typography>
          <List sx={{ overflowY: "auto", maxHeight: "80vh" }}>
            {matches.map((match) => (
              <ListItem
                button
                key={match.uuid}
                onClick={() => handleUserSelection(match.uuid)}
              >
                <ListItemAvatar>
                  <Avatar src={match.picture1} alt={match.dog_name} />
                </ListItemAvatar>
                <ListItemText
                  primary={match.dog_name}
                  secondary={`Owned by: ${match.human_first_name} ${match.human_last_name}`}
                />
                <Button variant="outlined" onClick={handleClickOpen}>
                  View Profile
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box
          sx={{ width: "70%", p: 2, display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h6">Messages</Typography>
          {loading ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </div>
          ) : userTo ? (
            <List sx={{ flex: 1, overflowY: "auto" }}>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.user_from === userFrom ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    style={{
                      background:
                        msg.user_from === userFrom ? "#0B93F6" : "#E5E5EA",
                      color: msg.user_from === userFrom ? "white" : "black",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      maxWidth: "70%",
                    }}
                  >
                    <ListItemText primary={msg.message_content} />
                  </Box>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          ) : (
            <Typography
              variant="h6"
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              Select a Match to start talking!
            </Typography>
          )}
          <TextField
            fullWidth
            variant="outlined"
            label="Type your message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(event) => {
              if (event.key === "Enter" && text.trim()) {
                sendMessage(event);
              }
            }}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{ mt: 1 }}
          >
            Send
          </Button>
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth={false}
          fullWidth={false}
          sx={{
            "& .MuiDialog-paper": {
              width: "650px",
              height: "83vh",
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle sx={{ padding: "8px 16px", textAlign: "center" }}>
            Your Match's Profile
          </DialogTitle>
          <DialogContent sx={{ padding: "8px 16px", overflow: "hidden" }}>
            {userData ? (
              <ProfileView userData={userData} />
            ) : (
              <CircularProgress />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
}

export default MessagingApp;
