import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import axios from "axios";

function Home() {
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/allusr");
      console.log(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={fetchAllUsers}>Add User</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default Home;
