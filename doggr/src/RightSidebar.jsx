import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  TextField,
  Button,
  Avatar,
  ListItemAvatar,
} from "@mui/material";

function RightSidebar() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [UserTo, setUserTo] = useState("");
  const [userFrom, setUserFrom] = useState("null");
  const messagesEndRef = useRef(null);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  useEffect(() => {
    if (messagesEndRef.current && messages.length > prevMessagesLength) {
      messagesEndRef.current.scrollIntoView();
    }
    setPrevMessagesLength(messages.length);
  }, [messages]);

  useEffect(() => {
    fetchUserUUID();
  }, []);

  useEffect(() => {
    if (userFrom) {
      fetchMatches();
    }
    const interval = setInterval(() => {
      if (UserTo) {
        fetchMessages();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [UserTo, userFrom]);

  const fetchUserUUID = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found.");
      return;
    }

    const wholeToken = "Bearer " + token;

    try {
      const response = await axios.post("http://localhost:3000/verify-token", {
        authorization: wholeToken,
      });
      if (response.data && response.data.user) {
        console.log("User ID retrieved:", response.data.user.id);
        setUserFrom(response.data.user.id);
      } else {
        console.error("Invalid token response structure:", response.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch user UUID:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const fetchMatches = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.post("http://localhost:3000/find-matches", {
        accessToken,
      });
      setMatches(response.data.matches);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    }
  };
  const fetchMessages = async () => {
    if (!userFrom || !UserTo) return;

    try {
      const response = await axios.get(
        `http://localhost:3000/messages?user_from=${userFrom}&user_to=${UserTo}`
      );
      console.log(`Fetching messages between ${userFrom} and ${UserTo}`);
      const fetchedMessages = response.data.filter(
        (msg) =>
          (msg.user_from === userFrom && msg.user_to === UserTo) ||
          (msg.user_from === UserTo && msg.user_to === userFrom)
      );

      if (JSON.stringify(messages) !== JSON.stringify(fetchedMessages)) {
        setMessages(fetchedMessages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error.message);
    }
    setLoading(false);
  };
  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim() || !userFrom || !UserTo) return;
    try {
      await axios.post("http://localhost:3000/send-message", {
        user_from: userFrom,
        user_to: UserTo,
        text,
      });
      setText("");
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error.message);
    }
  };

  const handleUserSelection = (uuid) => {
    console.log(UserTo);
    setUserTo(uuid);
    setMessages([]);
    setLoading(true);
  };

  return (
    <div className="KeepOnTop">
      <Box
        sx={{
          width: 300,
          height: "50vh",
          position: "fixed",
          zIndex: 30,
          top: 0,
          right: 0,
          bgcolor: "background.paper",
          boxShadow: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Matches
        </Typography>
        <List sx={{ overflowY: "auto", maxHeight: "45vh" }}>
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
            </ListItem>
          ))}
        </List>
      </Box>

      <Box
        sx={{
          width: 300,
          height: "50vh",
          position: "fixed",
          zIndex: 30,
          top: "50vh",
          right: 0,
          bgcolor: "background.paper",
          boxShadow: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Message{" "}
          {UserTo
            ? matches.find((match) => match.uuid === UserTo)?.dog_name
            : "Select a match"}
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
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
                  <ListItemText
                    primary={msg.message_content}
                    secondary={`From: ${msg.user_from}`}
                  />
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
        <TextField
          fullWidth
          variant="outlined"
          label="Type your message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(event) => {
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
          sx={{ marginTop: 1, width: "100%" }}
        >
          Send
        </Button>
      </Box>
    </div>
  );
}

export default RightSidebar;
