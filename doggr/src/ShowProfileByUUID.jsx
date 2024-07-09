import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoSettings } from "react-icons/io5";
import { MdMessage } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

function ShowProfilebyUUID() {
  const navigate = useNavigate();
  const emojis = "🎾🐾🐕‍🦺🥳🤗🤪".split(" ");
  const [userData, setUserData] = useState(null);

  const goSettings = () => {
    navigate("/settings");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await verifyTokenAndGetUserID();
        const data = await getNextUser();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const verifyTokenAndGetUserID = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
    if (!token) {
      console.error("No token found in local storage.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/verify-token", {
        authorization: wholeToken,
      });
      const userId = response.data.user.id;
      console.log("User ID:", userId);
    } catch (error) {
      console.error(
        "Error verifying token:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  const getNextUser = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        "http://localhost:3000/next-user-data",
        {
          accessToken: token,
        }
      );

      console.log("Next user data:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching next user data:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  const {
    basic: { human_first_name, human_last_name, dog_name, address },
    userdata: {
      bio,
      likeability,
      energy,
      playfulness,
      aggression,
      size,
      training,
    },
    pictures: { picture1, picture2, picture3, picture4, picture5 },
  } = userData;

  return (
    <div className="RootofRoot_MainPage">
      <div className="Varient2LeftMenuBar_MainPage">
        <button onClick={goSettings} className="TopInnerPage_MainPage">
          <IoSettings size={25} className="TopHomeIcon_MainPage" />
        </button>
        <button className="BottomInnerPage_MainPage">
          <FaXmark size={35} className="xMarkBottomHomeIcon_MainPage" />
        </button>
      </div>

      <div className="Whole_MainPage">
        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <img
            src={picture1}
            id="MainDogImage_MainPage"
            className="BorderRadius10px_MainPage"
            alt="Dog 1"
          />
          <div className="SmallDogImageGrid_MainPage BorderRadius10px_MainPage">
            <img
              src={picture2}
              className="SmallDogImage_MainPage"
              alt="Dog 2"
            />
            <img
              src={picture3}
              className="SmallDogImage_MainPage"
              alt="Dog 3"
            />
            <img
              src={picture4}
              className="SmallDogImage_MainPage"
              alt="Dog 4"
            />
            <img
              src={picture5}
              className="SmallDogImage_MainPage"
              alt="Dog 5"
            />
          </div>
        </div>

        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <h1>{dog_name}</h1>
          <p>{bio}</p>
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
          <p>
            Likeability: {likeability} | Energy: {energy} | Playfulness:{" "}
            {playfulness} | Aggression: {aggression} | Size: {size} | Training:{" "}
            {training}
          </p>
        </div>
      </div>

      <div className="Varient2RightMenuBar_MainPage">
        <button className="TopInnerPage_MainPage">
          <MdMessage size={25} className="RightTopHomeIcon_MainPage" />
        </button>
        <button className="BottomInnerPage_MainPage">
          <FaHeart size={25} className="RightBottomHomeIcon_MainPage" />
        </button>
      </div>
    </div>
  );
}

export default ShowProfilebyUUID;
