import MainPage from "./MainPage.jsx";
import Settings from "./SettingsPage.jsx";
import LoginPage from "./LoginPage.jsx";
import Test from "./test.jsx";
import SignUp from "./SignUpPage.jsx";

import "./general.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/dogs" element={<MainPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/test" element={<Test />} />
        <Route path="/*" element={<MainPage />} />
        <Route path="login" element={<LoginPage />} />

      </Routes>
    </Router>
  );
}

export default App;