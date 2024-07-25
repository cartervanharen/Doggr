import MainPage from "./MainPage.jsx";
import Settings from "./SettingsPage.jsx";
import LoginPage from "./LoginPage.jsx";
import SignUp from "./SignUpPage.jsx";
import ErrorPage from "./ErrorPage.jsx";
import Messages from "./MatchesMessages.jsx";
import Dashboard from "./Dashboard.jsx";

import "./general.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/status" element={<Dashboard />} />
        <Route
          path="/*"
          element={
            <ErrorPage>
              <Routes>
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dogs" element={<MainPage />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<MainPage />} />
              </Routes>
            </ErrorPage>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
