import { useState, useEffect } from "react";
import axios from "axios";
import "./global.css";

function GetDogImages() {
  const [imagesUrl, setImagesUrl] = useState({});
  useEffect(() => {
    const fetchImages = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

        const response = await axios.get(
          "http://localhost:3000/get-dog-pictures",
          {
            headers: {Authorization: token},
          }
        );
        if (response.status === 200) {
          const { picture1, picture2, picture3, picture4, picture5 } =
            response.data.userFilters;
          setImagesUrl({
            1: picture1,
            2: picture2,
            3: picture3,
            4: picture4,
            5: picture5,
          });
        } 
    };
    fetchImages();
  }, []);
  return (
    <div className="DogImageCard_MainPage BorderRadius10px_MainPage">
      <img
        src={imagesUrl[1]}
        id="MainDogImage_MainPage"
        className="BorderRadius10px_MainPage"
      />
      <div className="SmallDogImageGrid_MainPage BorderRadius10px_MainPage">
        <img src={imagesUrl[2]} className="SmallDogImage_MainPage" />
        <img src={imagesUrl[3]} className="SmallDogImage_MainPage" />
        <img src={imagesUrl[4]} className="SmallDogImage_MainPage" />
        <img src={imagesUrl[5]} className="SmallDogImage_MainPage" />
      </div>
    </div>
  );
}

export default GetDogImages;
