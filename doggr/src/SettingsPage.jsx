
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



// import { useState } from "react";
// import "./global.css";
// import axios from 'axios';

// function SignUp() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [address, setAddress] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [dogName, setDogName] = useState("");

//   const handleSignUp = async () => {
//     const userData = {
//       first_name: firstName,
//       last_name: lastName,
//       email: email,
//       address: address,
//       dog_name: dogName,
//       password: password 
//     };

//     try {
//       const response = await createUser(userData);
//       console.log("User created successfully:", response);
//     } catch (error) {
//       console.error("Error creating user:", error);
//       // Optionally, display an error message to the user
//     }
//   };

//   const createUser = async (userData) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:3000/create-user",
//         userData
//       );
//       return response.data;
//     } catch (error) {
//       console.error(
//         "Error creating user:",
//         error.response ? error.response.data : error.message
//       );
//       throw error;
//     }
//   };

//   return (
//     <div className="Whole_LoginPage">
//       <div className="UserInput_LoginPage">
//         <h1>Sign Up for Doggr</h1>

//         <input
//           className="InputField_LoginPage"
//           type="text"
//           value={firstName}
//           onChange={(e) => setFirstName(e.target.value)}
//           placeholder="First Name"
//         />

//         <input
//           className="InputField_LoginPage"
//           type="text"
//           value={lastName}
//           onChange={(e) => setLastName(e.target.value)}
//           placeholder="Last Name"
//         />

//         <input
//           className="InputField_LoginPage"
//           type="text"
//           value={dogName}
//           onChange={(e) => setDogName(e.target.value)}
//           placeholder="Dog's Name"
//         />

//         <input
//           className="InputField_LoginPage"
//           type="text"
//           value={address}
//           onChange={(e) => setAddress(e.target.value)}
//           placeholder="Address"
//         />

//         <input
//           className="InputField_LoginPage"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email"
//         />

//         <input
//           className="InputField_LoginPage"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//         />

//         <button className="InputField_LoginPage" onClick={handleSignUp}>
//           Create Account
//         </button>
//         <p>Your email will be your username.</p>

//         <h1>Already Have an Account?</h1>

//         <button
//           className="InputField_LoginPage"
//           onClick={() => console.log("Sign In functionality not implemented yet")}
//         >
//           Sign In
//         </button>
//       </div>
//     </div>
//   );
// }

// export default SignUp;