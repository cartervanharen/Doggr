import { useState, useRef, useEffect } from "react";
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
import Addtoken from "./Tests/AddToken.jsx";

function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const logsEndRef = useRef(null);
  const currentToken = localStorage.getItem("accessToken");
  const isTokenLogged = useRef(false); // Ref to check if token is already logged

  const [allUserData, setAllUserData] = useState([
    { title: "SupaBase", value: "Failed" },
    { title: "Node Server", value: "Failed" },
    { title: "Flask Server", value: "Failed" },
    { title: "Neural Network", value: "Failed" },
  ]);

  const signInStatus = SignInTest();
  const [singleUserData, setSingleUserData] = useState([
    { title: "Messaging", value: "Failed" },
    { title: "Login", value: signInStatus },
    { title: "Populate Next Users", value: "Failed" },
    { title: "Token Verification", value: "Failed" },
    { title: "Adjust Settings", value: "Failed" },
  ]);

  const StatusCard = ({ title, value }) => {
    const getStatusColor = (status) => (status === "Passing" ? "green" : "red");

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
    setLogs((prevLogs) => [...prevLogs, String(message)]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    if (!isTokenLogged.current) {
      const currentToken = localStorage.getItem("accessToken");
      addLog(`Current Token: ${String(currentToken)}`);
      isTokenLogged.current = true; 
    }
  }, []); 
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleLogin = async () => {
    try {
      if (username && password) {
        const userData = {
          email: username,
          password: password,
        };

        const signInAttempt = await Addtoken(userData);
        console.log(signInAttempt[0]);
        updateSingleUserData(1, signInAttempt[1]);
        addLog(signInAttempt[0]);
      }
    } catch (error) {
      addLog(error.message || error);
      console.error("Error during sign-in attempt:", error);
    }

    handleClose();
  };

  const handleUsernameChange = (event) => setUsername(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);

  const updateSingleUserData = (index, newValue) => {
    setSingleUserData((prevData) => {
      const newData = [...prevData];
      newData[index].value = newValue;
      return newData;
    });
  };

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
                  {allUserData.map((card, index) => (
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
                    onClick={() => {
                      window.location.reload();
                    }}
                    color="primary"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        const signInAttempt1 = await Addtoken({
                          email: "test@test.com",
                          password: "testtest",
                        });
                        console.log(signInAttempt1[0]);
                        updateSingleUserData(1, signInAttempt1[1]);
                        addLog(signInAttempt1[0]);
                      } catch (error) {
                        addLog(error.message || error);
                        console.error("Error during sign-in attempt:", error);
                      }
                    }}
                    color="secondary"
                  >
                    Sign in as TestUser1
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
                  {singleUserData.map((card, index) => (
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
                    width: 1045,
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
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
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
            onClick={handleLogin}
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
