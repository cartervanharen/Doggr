import { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./global.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const userData = {
      email: email,
      password: password,
    };
    try {
      const response = await signUserIn(userData);
      console.log("User signed in successfully:", response);

      setTimeout(() => {
        //wait for access token to be stored.
        navigate("/settings");
        window.location.reload();
        window.location.reload();
      }, 300);
    } catch (error) {
      error("Error signing in user:", error);
      setError("Failed to sign in. Check your email and password.");
    }
  };
  const signUserIn = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/signin",
        userData
      );
      console.log(response.data.session.access_token);
      localStorage.setItem("accessToken", response.data.session.access_token);
      return response.data;
    } catch (error) {
      console.error(
        "Error signing in user:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };
  return (
    <div className="Whole_LoginPage">
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Sign in to Doggr
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSignIn}
          >
            Sign In
          </Button>
          <Button fullWidth variant="text" onClick={() => navigate("/signup")}>
            No Account? Sign Up
          </Button>
        </Box>
      </Container>
    </div>
  );
}

export default LoginPage;
