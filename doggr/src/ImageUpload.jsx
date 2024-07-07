import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./global.css";

function ImageUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [picture1, setPicture1] = useState("");
  const [picture2, setPicture2] = useState("");
  const [picture3, setPicture3] = useState("");
  const [picture4, setPicture4] = useState("");
  const [picture5, setPicture5] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios({
        method: "post",
        url: "https://api.imgbb.com/1/upload",
        data: formData,
        params: {
          key: "4e4500a92ec8d511ccc8eb1f2154a221",
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setImageUrl(response.data.data.url);
        setPicture1(response.data.data.url);
      } else {
        console.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    handleSave();
  };

  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found in local storage.");
      return;
    }

    const updatedUserInfo = {
      accessToken: token,
      picture1,
      picture2,
      picture3,
      picture4,
      picture5,
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/update-dog-pictures",
        updatedUserInfo
      );

      console.log("dog pic updated successfully:", response.data.message);
    } catch (error) {
      console.error("Error updating dog information:", error.message);
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>
      {imageUrl && (
        <div>
          <p>Image Uploaded</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
