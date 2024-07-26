import { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ErrorPage = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const errorHandler = (error) => {
      setHasError(true);
    };
    window.addEventListener('error', errorHandler);
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  const handleButtonClick = () => {
    navigate('/settings');
    window.location.reload();
  };
  if (hasError) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 20,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "white",
          flexDirection: "column"
        }}
      >
        <h1>Something went wrong.</h1>
        <Button
          variant="contained"
          color="warning"
          onClick={handleButtonClick}
        >
          Oops, please make sure all the preferences are filled out
        </Button>
      </Box>
    );
  }
  return children;
};

export default ErrorPage;
