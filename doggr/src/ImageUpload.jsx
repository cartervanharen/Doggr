import { useState } from "react";
import axios from "axios";
import "./global.css";
import { Box, Button, Snackbar } from "@mui/material";

function ImageUpload() {
  const [file, setFile] = useState({});
  const [imagesUrl, setImagesUrl] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFileChange = async (event, index) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile({ ...file, [index]: selectedFile });
      await handleUpload(selectedFile, index);
    }
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
        setSnackbarOpen(true); 
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
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  return (
    <Box sx={{ height: 100, padding: 2, maxWidth: 300, margin: "auto" }}>
      <Button
        component="label"
        variant="outlined"
        fullWidth
        sx={{ mb: 0.3 }}
      >
        Upload Main Image
        <input
          type="file"
          hidden
          onChange={(e) => handleFileChange(e, 1)}
        />
      </Button>
      <Button
        component="label"
        variant="outlined"
        fullWidth
        sx={{ mb: 0.3 }}
      >
        Upload Mini Image 1
        <input
          type="file"
          hidden
          onChange={(e) => handleFileChange(e, 2)}
        />
      </Button>
      <Button
        component="label"
        variant="outlined"
        fullWidth
        sx={{ mb: 0.3 }}
      >
        Upload Mini Image 2
        <input
          type="file"
          hidden
          onChange={(e) => handleFileChange(e, 3)}
        />
      </Button>
      <Button
        component="label"
        variant="outlined"
        fullWidth
        sx={{ mb: 0.3 }}
      >
        Upload Mini Image 3
        <input
          type="file"
          hidden
          onChange={(e) => handleFileChange(e, 4)}
        />
      </Button>
      <Button
        component="label"
        variant="outlined"
        fullWidth
        sx={{ mb: 0.3 }}
      >
        Upload Mini Image 4
        <input
          type="file"
          hidden
          onChange={(e) => handleFileChange(e, 5)}
        />
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={"Picture uploaded"}
        sx={{ zIndex: 1000000 }}
      />
    </Box>
  );
}

export default ImageUpload;
