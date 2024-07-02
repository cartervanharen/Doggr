import { useState } from "react";
import "./global.css";
import axios from 'axios';

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dogName, setDogName] = useState("");

  const handleSignUp = async () => {
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      address: address,
      dog_name: dogName,
      password: password 
    };

    try {
      const response = await createUser(userData);
      console.log("User created successfully:", response);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/create-user",
        userData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating user:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  return (
    <div className="Whole_LoginPage">
      <div className="UserInput_LoginPage">
        <h1>Sign Up for Doggr</h1>

        <input
          className="InputField_LoginPage"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
        />

        <input
          className="InputField_LoginPage"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
        />

        <input
          className="InputField_LoginPage"
          type="text"
          value={dogName}
          onChange={(e) => setDogName(e.target.value)}
          placeholder="Dog's Name"
        />

        <input
          className="InputField_LoginPage"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
        />

        <input
          className="InputField_LoginPage"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          className="InputField_LoginPage"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button className="InputField_LoginPage" onClick={handleSignUp}>
          Create Account
        </button>
        <p>Your email will be your username.</p>

        <h1>Already Have an Account?</h1>

        <button
          className="InputField_LoginPage"
          onClick={() => console.log("Sign In functionality not implemented yet")}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

export default SignUp;