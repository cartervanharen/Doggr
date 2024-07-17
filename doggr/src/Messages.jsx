import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Divider,
  Box,
} from "@mui/material";

function MessagingApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userTo, setUserTo] = useState("testuser");

  const fetchMessages = useCallback(async () => {
    const url = `http://localhost:3000/messages/${encodeURIComponent(userTo)}`;
    console.log("Fetching from:", url);
    try {
      const response = await axios.get(url);
      console.log("Messages fetched:", response.data);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [userTo]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await axios.post("http://localhost:3000/send-message", {
        user_from: "testuser",
        user_to: userTo,
        text,
      });
      setText("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Paper
      style={{ padding: 20, width: "100%", maxWidth: 600, margin: "auto" }}
    >
      <Typography variant="h5" gutterBottom>
        Chat with {userTo}
      </Typography>
      <List style={{ maxHeight: 400, overflow: "auto" }}>
        {messages.map((msg, index) => (
          <ListItem
            key={index}
            alignItems="flex-start"
            style={{
              display: "flex",
              flexDirection:
                msg.user_from === "testuser" ? "row-reverse" : "row",
            }}
          >
            <Box
              bgcolor={msg.user_from === "testuser" ? "lightblue" : "lightgrey"}
              padding={1}
              borderRadius={10}
            >
              <ListItemText
                primary={msg.message_content}
                secondary={`From: ${msg.user_from}`}
              />
            </Box>
          </ListItem>
        ))}
      </List>
      <Divider />
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
