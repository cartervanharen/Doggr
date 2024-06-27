// Import CSS files
import './desktop.css';
import './mobile.css';

import { useState, useEffect } from "react";

const Test = () => {
  const [animate, setAnimate] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 777);

  useEffect(() => {
    const handleScroll = () => {
      const showAnimation = window.scrollY > 1  ;
      setAnimate(showAnimation);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 400);
      console.log(window.innerWidth > 400)
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const emojis = "🐶 🐕 🎾 🐾 🐕‍🦺 🥳 🤗 🤪 😟".split(" ");

  return (
    <div className={`container ${isDesktop ? 'desktop' : 'mobile'}`}>




    <div className='wholepage_mainprofile'>


 

    <div className='mainprofilecontent'> 

      <div className={`image-container toppageimg ${animate ? "bottomimgpage" : ""}`}>
        <img
          src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Smiling Dog"
          className="maindogimg"
        />
      </div>


    <div className='sidecontent_mainprofile'>
      <div className={`emojis left ${animate ? "slide-in-left" : ""}`}>
        {emojis.map((emoji, index) => (
          <div key={index}>{emoji}</div>
        ))}
      </div>

      <p className={`text right ${animate ? "slide-in-right" : ""}`}>Sammy</p>

      </div>


    </div>

    </div>

    </div>


  );
};

export default Test;