import { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.imgbb.com/1/upload',
        data: formData,
        params: {
          key: '4e4500a92ec8d511ccc8eb1f2154a221', 
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 200) {
        setImageUrl(response.data.data.url); 
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  console.log(imageUrl)
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>
      {imageUrl && (
        <div>
          <p>Image Uploaded: {imageUrl}</p>
          <img src={imageUrl} alt="Uploaded" style={{ width: '100px' }} />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
