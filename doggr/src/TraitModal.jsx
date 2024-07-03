import { useState } from "react";

function TraitModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [likeability, setLikeability] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [playfulness, setPlayfulness] = useState(5);
  const [aggression, setAggression] = useState(5);
  const [size, setSize] = useState(5);
  const [trainingLevel, setTrainingLevel] = useState(5);

  function Modal({ isOpen, close, children }) {
    if (!isOpen) return null;

    return (
      <div className="modalBackdrop_SettingsPage">
        <div className="modalContent_SettingsPage">
          {children}
          <button onClick={close} className="closeButton_SettingsPage">
            Save
          </button>

          <button onClick={handleCloseNoSave} className="closeButton_SettingsPage">
            Exit
          </button>


        </div>
      </div>
    );
  }

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
  const handleClose = () => {
    console.log("Closing modal...");
    console.log(`Likeability: ${likeability}`);
    console.log(`Energy: ${energy}`);
    console.log(`Playfulness: ${playfulness}`);
    console.log(`Aggression: ${aggression}`);
    console.log(`Size: ${size}`);
    console.log(`Training Level: ${trainingLevel}`);
    setIsOpen(false);
  };

  const handleCloseNoSave = () => {

    setIsOpen(false);
  };


  
  return (
    <div style={{ margin: "20px" }}>
      <h1>Trait Evaluation</h1>
      <button  className="InputField_SettingsPage" onClick={() => setIsOpen(true)}>Open Evaluation Form</button>

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
