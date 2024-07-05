import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function FilterModal() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [likeability, setLikeability] = useState({ min: 1, max: 10 });
  const [energy, setEnergy] = useState({ min: 1, max: 10 });
  const [playfulness, setPlayfulness] = useState({ min: 1, max: 10 });
  const [aggression, setAggression] = useState({ min: 1, max: 10 });
  const [size, setSize] = useState({ min: 1, max: 10 });
  const [trainingLevel, setTrainingLevel] = useState({ min: 1, max: 10 });

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
        setLikeability(likeabilityFilter);
        setEnergy(energyFilter);
        setPlayfulness(playfulnessFilter);
        setAggression(aggressionFilter);
        setSize(sizeFilter);
        setTrainingLevel(trainingFilter);
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
      <div className="modalBackdrop_SettingsPage">
        <div className="modalContent_SettingsPage">
          {children}
          <button onClick={close} className="closeButton_SettingsPage">
            Save
          </button>
          <button
            onClick={handleCloseNoSave}
            className="closeButton_SettingsPage"
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  function TraitSelector({ label, value, setValue }) {
    const handleMinChange = (e) => {
      const newMin = 11 - Number(e.target.value);
      if (newMin > value.max) {
        alert("Minimum value cannot be greater than maximum value.");
        return;
      } else {
        setValue({ ...value, min: newMin });
      }
    };

    const handleMaxChange = (e) => {
      const newMax = Number(e.target.value);
      if (newMax < value.min) {
        alert("Maximum value cannot be less than minimum value.");
        return;
      } else {
        setValue({ ...value, max: newMax });
      }
    };

    return (
      <div className="traitSelector_filterPage">
        <label className="label_filterPage">
          {label} ({value.min} - {value.max})
        </label>
        <div className="sliderContainer_filterPage">
          <input
            className="sliderMin_filterPage"
            type="range"
            min="1"
            max="10"
            value={11 - value.min}
            onChange={handleMinChange}
          />
          <input
            className="sliderMax_filterPage"
            type="range"
            min="1"
            max="10"
            value={value.max}
            onChange={handleMaxChange}
          />
        </div>
      </div>
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
        likeabilityFilter: likeability,
        energyFilter: energy,
        playfulnessFilter: playfulness,
        aggressionFilter: aggression,
        sizeFilter: size,
        trainingFilter: trainingLevel,
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

  return (
    <div style={{ margin: "20px" }}>
      <h1>User Filtering</h1>
      <button
        onClick={() => setIsOpen(true)}
        className="InputField_SettingsPage"
      >
        Set Filters
      </button>
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
    </div>
  );
}

export default FilterModal;
