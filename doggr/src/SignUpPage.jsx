import { useState } from 'react';
import { Button, TextField, Typography, Container, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./global.css";

function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dogName, setDogName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignUp = async () => {
    const userData = {
      human_first_name: firstName,
      human_last_name: lastName,
      email: email,
      address: address,
      dog_name: dogName,
      password: password,
    };

    try {
      const response = await createUser(userData);
      console.log("User created successfully:", response);
      setSuccessMessage("Account created successfully!"); 
      setTimeout(() => {
        navigate("/login");
      }, 5000); //wait 5 seconds before redirect to login
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.response ? error.response.data : error.message);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await axios.post("http://localhost:3000/signup", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

  return (
    <div className="Whole_LoginPage">
      <Container component="main" maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Sign Up for Doggr
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="fname"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="lname"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Dog's Name"
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
              autoComplete="dog-name"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Home Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="address"
            />
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
              autoComplete="new-password"
              helperText="6+ characters long"
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSignUp}
            >
              Create Account
            </Button>
            <Typography variant="body2" color="textSecondary" align="center">
              Your email will be your username.
            </Typography>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => navigate("/login")}
            >
              Already Have an Account? Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default SignUp;
