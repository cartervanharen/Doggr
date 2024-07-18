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
} from "@mui/material";

function RightSidebar() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const userFrom = "Carter";
  const userTo = "Sammy";
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/messages?user_from=${userFrom}&user_to=${userTo}`
      );
      if (response.status === 200) {
        setMessages(response.data);
        setLoading(false);
      } else {
        console.error("Failed to fetch messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 100000); // Change this for demo!!!
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
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
    <div className="KeepOnTop">
      <Box
        sx={{
          width: 300,
          height: "50vh",
          position: "fixed",
          zIndex: 30,
          top: "0",
          right: 0,
          bgcolor: "background.paper",
          boxShadow: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" gutterBottom component="div">
          Matches
        </Typography>







        
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
        <Typography variant="h6" gutterBottom component="div">
          Message {userTo}
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
        <Box sx={{ padding: 1 }}>
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
      </Box>
    </div>
  );
}

export default RightSidebar;
