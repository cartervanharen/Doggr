import "./desktop.css";

const Test = () => {
  const emojis = "🐶 🐕 🎾 🐾 🐕‍🦺 🥳 🤗 🤪 😟".split(" ");
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
    <div>
      <div className="Whole_MainPage">



        <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
          <img
            src={dogPicture1}
            id="MainDogImage_MainPage" className="BorderRadius10px_MainPage"/>

          <div className="SmallDogImageGrid_MainPage BorderRadius10px_MainPage">
            <img src={dogPicture2} className="SmallDogImage_MainPage" />
            <img src={dogPicture3} className="SmallDogImage_MainPage" />
            <img src={dogPicture4} className="SmallDogImage_MainPage" />
            <img src={dogPicture5} className="SmallDogImage_MainPage" />
          </div>
        </div>



        <div className="BorderRadius10px_MainPage">
         
        </div>















        <div>
          <div>
            {emojis.map((emoji, index) => (
              <div key={index}>{emoji}</div>
            ))}
          </div>
        </div>

        <p>Badges Go here</p>
      </div>
    </div>
  );
};

export default Test;
