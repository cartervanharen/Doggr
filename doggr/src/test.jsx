import "./App.css";

// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import "./App.css";

const Test = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const showAnimation = window.scrollY > 50;
      if (showAnimation !== animate) {
        setAnimate(showAnimation);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [animate]);

  const emojis = "🐶 🐕 🎾 🐾 🐕‍🦺 🥳 🤗 🤪 😟".split(" ");

  return (
    <div className="container">
      <img
        className="maindogimg"
        src="https://img.freepik.com/free-photo/isolated-happy-smiling-dog-white-background-portrait-4_1562-693.jpg"
        alt="Smiling Dog"
      />

      <div className={`emojis left ${animate ? "slide-in-left" : ""}`}>
        {emojis.map((emoji, index) => (
          <div key={index}>{emoji}</div>
        ))}
      </div>

      <p className={`text right ${animate ? "slide-in-right" : ""}`}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </div>
  );
};

export default Test;
