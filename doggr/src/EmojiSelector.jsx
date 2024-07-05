import { useState } from "react";
import "./global.css";

function EmojiSelector({ emojis }) {
  const [selectedEmojiIndices, setSelectedEmojiIndices] = useState([]);

  const handleEmojiClick = (index) => {
    if (selectedEmojiIndices.includes(index)) {
      setSelectedEmojiIndices(selectedEmojiIndices.filter((i) => i !== index));
    } else {
      setSelectedEmojiIndices([...selectedEmojiIndices, index]);
    }
  };
  const logSelectedEmojis = () => {
    console.log(
      "Selected Emojis:",
      selectedEmojiIndices.map((index) => emojis[index])
    );
  };

  return (
    <div className="EmojiCard_MainPage BorderRadius10px_MainPage">
      {emojis.map((emoji, index) => (
        <span
          key={index}
          className={`Emojis_MainPage ${
            selectedEmojiIndices.includes(index) ? "selected" : ""
          }`}
          onClick={() => handleEmojiClick(index)}
        >
          {emoji}
        </span>
      ))}
      {/* Button to log selected emojis */}
      <button onClick={logSelectedEmojis}>Log Selected Emojis</button>
    </div>
  );
}

export default EmojiSelector;
