import  { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, CircularProgress, List, ListItem, ListItemText, Avatar, ListItemAvatar } from '@mui/material';
import ProfileView from './ProfileView';

function MessagingApp() {
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userFrom, setUserFrom] = useState('');
  const [userTo, setUserTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
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
    }, 100000); //Chats wont load in untill 100,000 seconds, CHANGE THIS FOR ACTUAL DEMO. Currently set high to reduce db calls during testing.
    return () => clearInterval(interval);
  }, [userTo, userFrom]);

  useEffect(() => {
    if (messagesEndRef.current && messages.length > prevMessagesLength) {
      messagesEndRef.current.scrollIntoView();
    }
    setPrevMessagesLength(messages.length);
  }, [messages]);

  const fetchUserUUID = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found.');
      return;
    }
    const wholeToken = 'Bearer ' + token;
    try {
      const response = await axios.post('http://localhost:3000/verify-token', {
        authorization: wholeToken,
      });
      if (response.data && response.data.user) {
        setUserFrom(response.data.user.id);
      } else {
        console.error('Invalid token response structure:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user UUID:', error);
    }
  };

  const fetchMatches = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await axios.post('http://localhost:3000/find-matches', {
        accessToken,
      });
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const fetchMessages = async (isIntervalFetch = false) => {
    if (!userFrom || !userTo) return;
    try {
      const response = await axios.get(`http://localhost:3000/messages?user_from=${userFrom}&user_to=${userTo}`);
      const fetchedMessages = response.data.filter(
        (msg) =>
          (msg.user_from === userFrom && msg.user_to === userTo) ||
          (msg.user_from === userTo && msg.user_to === userFrom)
      );

      if (JSON.stringify(messages) !== JSON.stringify(fetchedMessages)) {
        setMessages(fetchedMessages);
        if (!isIntervalFetch) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
    setLoading(false);
  };

  const fetchUserProfile = async (userId) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.post('http://localhost:3000/user-profile', {
        userId,
        accessToken: token,
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim() || !userFrom || !userTo) return;
    try {
      await axios.post('http://localhost:3000/send-message', {
        user_from: userFrom,
        user_to: userTo,
        text,
      });
      setText('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUserSelection = (uuid) => {
    setUserTo(uuid);
    setMessages([]);
    setLoading(true);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ width: '30%', borderRight: '1px solid #ccc', p: 2 }}>
        <Typography variant='h6'>Matches</Typography>
        <List sx={{ overflowY: 'auto', maxHeight: '80vh' }}>
          {matches.map((match) => (
            <ListItem button key={match.uuid} onClick={() => handleUserSelection(match.uuid)}>
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
      <Box sx={{ width: '40%', p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant='h6'>Messages</Typography>
        {loading ? <CircularProgress /> : <List sx={{ flex: 1, overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.user_from === userFrom ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                style={{
                  background: msg.user_from === userFrom ? '#0B93F6' : '#E5E5EA',
                  color: msg.user_from === userFrom ? 'white' : 'black',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  maxWidth: '70%',
                }}
              >
                <ListItemText primary={msg.message_content} />
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>}
        <TextField
          fullWidth
          variant='outlined'
          label='Type your message'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(event) => {
            if (event.key === 'Enter' && text.trim()) {
              sendMessage(event);
            }
          }}
          margin='normal'
        />
        <Button variant='contained' color='primary' onClick={sendMessage} sx={{ mt: 1 }}>
          Send
        </Button>
      </Box>
      <Box sx={{ width: '30%', p: 2 }}>
        <Typography variant='h6'>Profile</Typography>
        {userData ? <ProfileView userData={userData} /> : <Typography>Select a match to view profile</Typography>}
      </Box>
    </Box>
  );
}

export default MessagingApp;