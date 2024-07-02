import "./global.css";
import { AiFillHome } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";

const MainPage = () => {
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

export default MainPage;
