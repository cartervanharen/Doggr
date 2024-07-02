import { useState } from "react";
import "./global.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
      console.log("User sign in successfully:", response);
      navigate("/home");
    } catch (error) {
      console.error("Error signing in user:", error);
      setError("Failed to sign in. Check your email and password.");
    }
  };

  const signUserIn = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/signin",
        userData
      );
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
      <div className="UserInput_LoginPage">
        <h1>Sign in to Doggr</h1>
        {error && <p className="Error_Message">{error}</p>}
        <input
          className="InputField_LoginPage"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=" Email"
        />
        <input
          className="InputField_LoginPage"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" Password  (6+ characters long)"
        />
        <button className="InputField_LoginPage" onClick={handleSignIn}>
          Sign In
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
