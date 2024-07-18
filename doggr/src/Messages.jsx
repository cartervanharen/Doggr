import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";

function MessagingApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const userFrom = "Carter";
  const userTo = "Sammy";
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const fetchUserUUID = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.post("http://localhost:3000/verify-token", {
        accessToken,
      });
      return(response);
    } catch (error) {
      console.error("Failed to fetch user UUID:", error);
    }
  };
  const test  =fetchUserUUID()
  console.log(test.data)
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/messages?user_from=${userFrom}&user_to=${userTo}`
      );
      if (response.status === 200) {
        setMessages(response.data);
      } else {
        console.error("Failed to fetch messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const response = await axios.post("http://localhost:3000/send-message", {
        user_from: userFrom,
        user_to: userTo,
        text,
      });
      if (response.status === 201) {
        setText("");
        fetchMessages();
      }
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response ? error.response.data : "No response"
      );
    }
  };

  return (
    <Paper
      style={{ padding: 20, width: "100%", maxWidth: 600, margin: "auto" }}
    >
      <Typography variant="h5" gutterBottom>
        Chat between Carter and Sammy
      </Typography>
      <List style={{ maxHeight: 400, overflow: "auto" }}>
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
                background: msg.user_from === userFrom ? "#0B93F6" : "#E5E5EA",
                color: msg.user_from === userFrom ? "white" : "black",
                padding: "8px 16px",
                borderRadius: "20px",
                maxWidth: "70%",
              }}
            >
              <ListItemText
                primary={msg.message_content}
                secondary={`From: ${msg.user_from} - To: ${msg.user_to}`}
              />
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <TextField
        fullWidth
        variant="outlined"
        label="Type your message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(event) => {
          if (event.key === "Enter" && text.trim()) {
            sendMessage();
          }
        }}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={sendMessage}
        style={{ marginTop: 10 }}
      >
        Send
      </Button>
    </Paper>
  );
}

export default MessagingApp;
