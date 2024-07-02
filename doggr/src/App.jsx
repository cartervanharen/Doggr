

import MainPage from "./MainPage.jsx";
import Settings from "./SettingsPage.jsx";
import LoginPage from "./LoginPage.jsx";

import SignUp from "./SignUpPage.jsx";

import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {

  // const addUser = async () => {
  //   try {
  //     const response = await axios.post("http://localhost:3000/users");
  //     console.log()
  //     return response;
  //   } catch (error) {
  //     console.error("Error adding user:", error);
  //   }
  // };

  return (

    <Router>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="login" element={<LoginPage />} />

      </Routes>
    </Router>



  );
}

export default App;