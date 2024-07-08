import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TraitModal() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [likeability, setLikeability] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [playfulness, setPlayfulness] = useState(5);
  const [aggression, setAggression] = useState(5);
  const [size, setSize] = useState(5);
  const [trainingLevel, setTrainingLevel] = useState(5);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in local storage.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.post("http://localhost:3000/userdata", {
          accessToken: token,
        });
        const userData = response.data.user;
        setLikeability(userData.likeability);
        setEnergy(userData.energy);
        setPlayfulness(userData.playfulness);
        setAggression(userData.aggression);
        setSize(userData.size);
        setTrainingLevel(userData.training);
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

  // eslint-disable-next-line react/prop-types
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
  // eslint-disable-next-line react/prop-types
  function TraitSelector({ label, value, setValue }) {
    return (
      <div>
        <label>
          {label}: {value}
        </label>
        <input
          className="slider_SettingsPage"
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
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
      await axios.post("http://localhost:3000/update-dog-traits", {
        accessToken: token,
        likeability,
        energy,
        playfulness,
        aggression,
        size,
        training: trainingLevel,
      });
      console.log("Dog traits updated successfully.");
    } catch (error) {
      console.error(
        "Error updating dog traits:",
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : error.message
      );
    }

    setIsOpen(false);
  };

  const handleCloseNoSave = () => {
    setIsOpen(false);
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1>Trait Evaluation</h1>
      <button
        onClick={() => setIsOpen(true)}
        className="InputField_SettingsPage"
      >
        Select Traits
      </button>
      <Modal isOpen={isOpen} close={handleClose}>
        <TraitSelector
          label="Likeability"
          value={likeability}
          setValue={setLikeability}
        />
        <p>
          (1 being very reserved or anxious with strangers, 10 being extremely
          outgoing and sociable)
        </p>
        <TraitSelector label="Energy" value={energy} setValue={setEnergy} />
        <p>
          (1 being minimal exercise needed, satisfied with short walks, 10 being
          needs extensive, vigorous exercise)
        </p>
        <TraitSelector
          label="Playfulness"
          value={playfulness}
          setValue={setPlayfulness}
        />
        <p>
          (1 being seldom initiates play, generally inactive, 10 being
          constantly seeking play and interaction)
        </p>
        <TraitSelector
          label="Aggression"
          value={aggression}
          setValue={setAggression}
        />
        <p>
          (1 being highly aggressive or defensive, 10 being completely welcoming
          and unbothered)
        </p>
        <TraitSelector label="Size" value={size} setValue={setSize} />
        <p>
          (1 being significantly smaller than the breed average, 10 being
          significantly larger than the breed average)
        </p>
        <TraitSelector
          label="Training Level"
          value={trainingLevel}
          setValue={setTrainingLevel}
        />
        <p>
          (1 being easily distracted and rarely follows commands, 10 being
          highly focused and consistently obeys commands)
        </p>
      </Modal>
    </div>
  );
}

export default TraitModal;

