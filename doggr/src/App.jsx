import MainPage from "./MainPage.jsx";
import Settings from "./SettingsPage.jsx";
import LoginPage from "./LoginPage.jsx";
import SignUp from "./SignUpPage.jsx";
import ErrorPage from "./ErrorPage.jsx";
import Messages from "./Matches&Messages.jsx";
import "./general.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <ErrorPage>
        <Routes>
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dogs" element={<MainPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/*" element={<MainPage />} />
          <Route path="login" element={<LoginPage />} />
        </Routes>
      </ErrorPage>
    </Router>
  );
}

export default App;
