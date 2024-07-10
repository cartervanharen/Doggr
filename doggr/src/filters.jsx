import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { Slider, Box, Typography, Button, Snackbar } from "@mui/material";

function FilterModal() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [likeability, setLikeability] = useState([1, 10]);
  const [energy, setEnergy] = useState([1, 10]);
  const [playfulness, setPlayfulness] = useState([1, 10]);
  const [aggression, setAggression] = useState([1, 10]);
  const [size, setSize] = useState([1, 10]);
  const [trainingLevel, setTrainingLevel] = useState([1, 10]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in local storage.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/current-dog-filters",
          {
            accessToken: token,
          }
        );
        const {
          likeabilityFilter,
          energyFilter,
          playfulnessFilter,
          aggressionFilter,
          sizeFilter,
          trainingFilter,
        } = response.data.userFilters;
        setLikeability([likeabilityFilter.min, likeabilityFilter.max]);
        setEnergy([energyFilter.min, energyFilter.max]);
        setPlayfulness([playfulnessFilter.min, playfulnessFilter.max]);
        setAggression([aggressionFilter.min, aggressionFilter.max]);
        setSize([sizeFilter.min, sizeFilter.max]);
        setTrainingLevel([trainingFilter.min, trainingFilter.max]);
      } catch (error) {
        console.error(
          "Error fetching user information:",
          error.response ? error.response.data : error.message
        );
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, [navigate]);

  function Modal({ isOpen, close, children }) {
    if (!isOpen) return null;

    return (
      <Box className="modalBackdrop_SettingsPage">
        <Box className="modalContent_SettingsPage">
          {children}
          <Button onClick={close} className="closeButton_SettingsPage">
            Save
          </Button>
          <Button
            onClick={handleCloseNoSave}
            className="closeButton_SettingsPage"
          >
            Exit
          </Button>
        </Box>
      </Box>
    );
  }

  function TraitSelector({ label, value, setValue }) {
    const handleChange = (event, newValue) => {
      if (newValue[0] >= newValue[1]) {
        setSnackbarMessage("Minimum value must be less than maximum value.");
        setSnackbarOpen(true);
        return;
      }
      setValue(newValue);
    };

    return (
      <Box sx={{ width: 300, margin: "20px" }}>
        <Typography gutterBottom>
          {label} ({value[0]} - {value[1]})
        </Typography>
        <Slider
          value={value}
          onChange={handleChange}
          valueLabelDisplay="auto"
          min={1}
          max={10}
          marks
          step={1}
          sx={{ marginBottom: 2 }}
          color="secondary"
        />
      </Box>
    );
  }

  const handleClose = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found in local storage.");
      navigate("/login");
      return;
    }

    try {
      await axios.post("http://localhost:3000/update-dog-filter", {
        accessToken: token,
        likeabilityFilter: { min: likeability[0], max: likeability[1] },
        energyFilter: { min: energy[0], max: energy[1] },
        playfulnessFilter: { min: playfulness[0], max: playfulness[1] },
        aggressionFilter: { min: aggression[0], max: aggression[1] },
        sizeFilter: { min: size[0], max: size[1] },
        trainingFilter: { min: trainingLevel[0], max: trainingLevel[1] },
      });
      console.log("User filters updated successfully.");
      setIsOpen(false);
    } catch (error) {
      console.error(
        "Error updating user filters:",
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : error.message
      );
    }
  };

  const handleCloseNoSave = () => {
    setIsOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div style={{ margin: "20px" }}>
      <Button
        variant="outlined"
        onClick={() => setIsOpen(true)}
        className="InputField_SettingsPage"
      >
        Set Filters
      </Button>
      <Modal isOpen={isOpen} close={handleClose}>
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
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        sx={{ zIndex: 1000000 }}
      />
    </div>
  );
}

export default FilterModal;

FilterModal.propTypes = {
  label: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.number).isRequired,
  setValue: PropTypes.func,
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  children: PropTypes.node,
};
