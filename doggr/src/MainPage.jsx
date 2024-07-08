import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./global.css";
import { IoSettings } from "react-icons/io5";
import { MdMessage } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";



const MainPage = () => {
  const navigate = useNavigate();

  const verifyTokenAndGetUserID = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
    console.log(wholeToken);
    if (!token) {
      console.error("No token found in local storage.");
      navigate("/login");
      return;
    }

    try {
      console.log("line28");

      const response = await axios.post("http://localhost:3000/verify-token", {
        authorization: wholeToken,
      });

      const userId = response.data.user.id;
      console.log("User ID retrieved:", userId);
    } catch (error) {
      console.error(
        "Error verifying token:",
        error.response ? error.response.data : error.message
      );
      navigate("/login");
    }
  };

  useEffect(() => {
    verifyTokenAndGetUserID();
  });

  const emojis = "🎾🐾🐕‍🦺🥳🤗🤪".split(" ");
  const dogPicture1 =
    "https://cdn.outsideonline.com/wp-content/uploads/2023/03/Funny_Dog_S.jpg";

  const dogPicture2 =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQcJkEHHWM9n4Xptqcsp661O0Cgl-kvCSPxA&s";
  const dogPicture3 =
    "https://static01.nyt.com/images/2022/05/10/science/28DOGS-BEHAVIOR1/28DOGS-BEHAVIOR1-mediumSquareAt3X-v2.jpg";
  const dogPicture4 =
    "https://supertails.com/cdn/shop/articles/1-2-1703948078392.jpg?v=1713875436";
  const dogPicture5 =
    "https://www.statnews.com/wp-content/uploads/2024/03/AP110520117877-645x645.jpg";

  const goSettings = () => {
    navigate("/settings");
  };

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
            src={dogPicture1}
            id="MainDogImage_MainPage"
            className="BorderRadius10px_MainPage"
          />
          <div className="SmallDogImageGrid_MainPage BorderRadius10px_MainPage">
            <img src={dogPicture2} className="SmallDogImage_MainPage" />
            <img src={dogPicture3} className="SmallDogImage_MainPage" />
            <img src={dogPicture4} className="SmallDogImage_MainPage" />
            <img src={dogPicture5} className="SmallDogImage_MainPage" />
          </div>
        </div>

        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <h1>Julio</h1>
          <p>
            Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog Dog
            Dog Dog Dog Dog Dog Dog Dog Dog Dog{" "}
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
};

export default MainPage;
