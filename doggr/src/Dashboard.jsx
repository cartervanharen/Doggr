import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Modal,
  TextField,
} from "@mui/material";
import SignInTest from "./Tests/SignInTest";

function Dashboard() {
  const signInStatus = SignInTest();
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const logsEndRef = useRef(null);

  const AllUserData = [
    { title: "SupaBase", value: "Failed" },
    { title: "Node Server", value: "Passing" },
    { title: "Flask Server", value: "Failed" },
    { title: "Neural Network", value: "Failed" },

  ];

  const SingleUserData = [
    { title: "Messaging", value: "Passing" },                                                                  
    { title: "Sign Up", value: "Failed" },
    { title: "Login", value: signInStatus },
    { title: "Populate Next Users", value: "Failed" },
    { title: "Token Verification", value: "Passing" },
    { title: "Adjust Settings", value: "Passing" },

  ];

  const StatusCard = ({ title, value }) => {
    const getStatusColor = (status) => {
      return status === "Passing" ? "green" : "red";
    };

    return (
      <Card data-testid="card">
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: getStatusColor(value),
                marginRight: 1,
              }}
            />
            <Typography variant="h5" component="div">
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {value}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleUsernameChange = (event) => setUsername(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);

  return (
    <>
      <p className="AllUsersText">All Users</p>
      <p className="SingleUserText">Single User</p>

      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexDirection: "row", marginTop: 4 }}>
          <Box sx={{ flexGrow: 1, marginLeft: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Doggr Status
                </Typography>
              </Grid>
              <div className="content_divider">
                <Grid container spacing={3}>
                  {AllUserData.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <StatusCard title={card.title} value={card.value} />
                    </Grid>
                  ))}
                </Grid>
              </div>

              <div className="content_divider">
                <Box
                  display="flex"
                  flexDirection="row"
                  gap={2}
                  sx={{ pl: 0, pb: 3.8 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => addLog("Refreshed Test")}
                    color="primary"
                  >
                    Refresh Test
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => addLog("Signed in as TestUser1")}
                    color="secondary"
                  >
                    Sign in as TestUser1
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => addLog("Signed in as TestUser2")}
                    color="secondary"
                  >
                    Sign in as TestUser2
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => addLog("Signed in as TestUser3")}
                    color="secondary"
                  >
                    Sign in as TestUser3
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleOpen}
                    color="secondary"
                  >
                    Sign in as Custom User
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  {SingleUserData.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <StatusCard title={card.title} value={card.value} />
                    </Grid>
                  ))}
                </Grid>
              </div>
              <Grid item xs={12}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Console Log
                </Typography>
                <Paper
                  elevation={3}
                  sx={{
                    padding: 2,
                    height: 200,
                    overflow: "auto",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <Box sx={{ whiteSpace: "pre-wrap" }}>
                    {logs.map((log, index) => (
                      <Typography key={index} variant="body2">
                        {log}
                      </Typography>
                    ))}
                    <div ref={logsEndRef} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            Custom User Login
          </Typography>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            variant="outlined"
            value={username}
            onChange={handleUsernameChange}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            variant="outlined"
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              addLog(`Custom User Login attempted with username: ${username}`);
              handleClose();
            }}
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Modal>
    </>
  );
}

export default Dashboard;
