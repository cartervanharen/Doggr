
import Home from "./home.jsx";
import Test from "./test.jsx";
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
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />

      </Routes>
    </Router>



  );
}

export default App;