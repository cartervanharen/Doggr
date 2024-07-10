import { useState } from "react";
import axios from "axios";
import "./global.css";

function ImageUpload() {
  const [file, setFile] = useState({});
  const [imagesUrl, setImagesUrl] = useState({});

  const handleFileChange = async (event, index) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile({ ...file, [index]: selectedFile });
      await handleUpload(selectedFile, index);
    }

    window.location.reload();
  };

  const handleUpload = async (file, index) => {
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
        const imageUrl = response.data.data.url;
        setImagesUrl({ ...imagesUrl, [index]: imageUrl });
        handleSave(index, imageUrl);
      } else {
        console.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSave = async (index, imageUrl) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found in local storage.");
      return;
    }

    const updatedUserInfo = {
      accessToken: token,
      [`picture${index}`]: imageUrl,
      
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/update-dog-pictures",
        updatedUserInfo
      );

      console.log(
        `Picture ${index} updated successfully:`,
        response.data.message
      );
    } catch (error) {
      console.error(`Error updating picture ${index}:`, error.message);
    }
  };

  return (
    <div>
      <div className="EditButtons__SettingsPage">
        <div className="" key="1">
          <label htmlFor="fileUpload1" className="button_ImageUploadPage">
            Upload Main Image
          </label>
          <input
            id="fileUpload1"
            type="file"
            onChange={(e) => handleFileChange(e, 1)}
            style={{ display: "none" }}
          />
        </div>
        <div key="2">
          <label htmlFor="fileUpload2" className="button_ImageUploadPage">
            Upload Secondary Image
          </label>
          <input
            id="fileUpload2"
            type="file"
            onChange={(e) => handleFileChange(e, 2)}
            style={{ display: "none" }}
          />
        </div>
        <div key="3">
          <label htmlFor="fileUpload3" className="button_ImageUploadPage">
            Upload Third Image
          </label>
          <input
            id="fileUpload3"
            type="file"
            onChange={(e) => handleFileChange(e, 3)}
            style={{ display: "none" }}
          />
        </div>
        <div key="4">
          <label htmlFor="fileUpload4" className="button_ImageUploadPage">
            Upload Fourth Image
          </label>
          <input
            id="fileUpload4"
            type="file"
            onChange={(e) => handleFileChange(e, 4)}
            style={{ display: "none" }}
          />
        </div>
        <div key="5">
          <label htmlFor="fileUpload5" className="button_ImageUploadPage">
            Upload Fifth Image
          </label>
          <input
            id="fileUpload5"
            type="file"
            onChange={(e) => handleFileChange(e, 5)}
            style={{ display: "none" }}
          />
        </div>
      </div>
    </div>
  );
}

export default ImageUpload;
