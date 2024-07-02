
import "./global.css";
import { AiFillHome } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { useState } from "react";

const SettingsPage = () => {
  const emojis = "🎾🐾🐕‍🦺🥳🤗🤪".split(" ");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = (event) => {
      event.preventDefault();
      // Handle form submission here
    };
  
  return (
    <div className="RootofRoot_MainPage">
      <button className="LeftMenuBar_MainPage">
        <IoSettings size={35} className="HomeIcon_MainPage" />
        ___
        <br></br>
        <p>P</p>
        <p>A</p>
        <p>S</p>
        <p>S</p>
      </button>

      <div className="Whole_MainPage">
        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <h1>Profile</h1>

          <form onSubmit={handleSubmit}>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <br />
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <br />
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <h1>Location</h1>
          <p>
            Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog
            Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog{" "}
          </p>
        </div>

        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <h1>Filters</h1>
          <p>
            Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog
            Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog{" "}
          </p>
        </div>

        <div className="EmojiCard_MainPage BorderRadius10px_MainPage">
          <div className="InnerEmojiCard_MainPage BorderRadius10px_MainPage">
            {emojis.map((emoji, index) => (
              <span key={index} className="Emojis_MainPage">
                {emoji}
              </span>
            ))}
          </div>
        </div>

        <div className="EmojiCard_MainPage BorderRadius10px_MainPage">
          <p>Age: 5 | 9 mi | 30 lbs</p>
        </div>

        {/* <div className="footer">testtesttesttesttesttesttest</div> */}
      </div>

      <button className="RightMenuBar_MainPage">
        <AiFillHome size={35} className="HomeButton_MainPage" />
        ___
        <br></br>
        <p>L</p>
        <p>I</p>
        <p>K</p>
        <p>E</p>
      </button>
    </div>
  );
};

export default SettingsPage;
