import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Slider, Typography, Button, Modal, Box } from "@mui/material";

function TraitModal() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [likeability, setLikeability] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [playfulness, setPlayfulness] = useState(5);
  const [aggression, setAggression] = useState(5);
  const [size, setSize] = useState(5);
  const [trainingLevel, setTrainingLevel] = useState(5);
  const refreshUsers = async () => {
    const token = localStorage.getItem("accessToken");
    const wholeToken = "Bearer " + token;
    if (!token) {
      return;
    }
    const response = await axios.post("http://localhost:3000/verify-token", {
      authorization: wholeToken,
    });
    const userId = response.data.user.id;

    const responseUsers = await axios.post(
      "http://localhost:3000/generate-new-nextusers",
      {
        userid: userId,
      }
    );
    return responseUsers;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      const response = await axios.get("http://localhost:3000/get-userdata", {
        headers: { Authorization: token },
      });
      const userData = response.data.user;
      setLikeability(userData.likeability);
      setEnergy(userData.energy);
      setPlayfulness(userData.playfulness);
      setAggression(userData.aggression);
      setSize(userData.size);
      setTrainingLevel(userData.training);
    };

    fetchUserInfo();
  }, [navigate]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }
    await axios.post("http://localhost:3000/update-dog-traits", {
      accessToken: token,
      likeability,
      energy,
      playfulness,
      aggression,
      size,
      training: trainingLevel,
    });
    refreshUsers();

    setIsOpen(false);
  };

  const handleCloseNoSave = () => {
    setIsOpen(false);
  };

  function TraitSelector({ label, value, setValue }) {
    return (
      <Box sx={{ width: 300, margin: "20px" }}>
        <Typography gutterBottom>
          {label}: {value}
        </Typography>
        <Slider
          value={value}
          onChange={(e, newValue) => setValue(newValue)}
          aria-labelledby="input-slider"
          min={1}
          max={10}
        />
      </Box>
    );
  }

  return (
    <div style={{ margin: "20px" }}>
      <Button variant="outlined" onClick={handleOpen}>
        Select Traits
      </Button>
      <Modal
        open={isOpen}
        onClose={handleCloseNoSave}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <TraitSelector
            label="Likeability"
            value={likeability}
            setValue={setLikeability}
          />
          <TraitSelector label="Energy" value={energy} setValue={setEnergy} />
          <TraitSelector
            label="Playfulness"
            value={playfulness}
            setValue={setPlayfulness}
          />
          <TraitSelector
            label="Aggression"
            value={aggression}
            setValue={setAggression}
          />
          <TraitSelector label="Size" value={size} setValue={setSize} />
          <TraitSelector
            label="Training Level"
            value={trainingLevel}
            setValue={setTrainingLevel}
          />
          <Button onClick={handleClose} color="primary">
            Save
          </Button>
          <Button onClick={handleCloseNoSave} color="secondary">
            Exit
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default TraitModal;
