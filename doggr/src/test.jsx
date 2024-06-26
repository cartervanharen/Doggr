
import "./App.css";

// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import './App.css';


const Test = () => {
    const [animate, setAnimate] = useState(false);





    useEffect(() => {
        const handleScroll = () => {
            const showAnimation = window.scrollY > 20;
            if (showAnimation !== animate) {
                setAnimate(showAnimation);
            }
        };
    
        window.addEventListener('scroll', handleScroll, { passive: true });
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [animate]);


    return (
        <div className="container">
            <img className={`maindogimg toppageimg ${animate ? 'bottomimgpage' : ''}`} src="https://img.freepik.com/free-photo/isolated-happy-smiling-dog-white-background-portrait-4_1562-693.jpg" alt="Smiling Dog"/>
            <p className={`text left ${animate ? 'slide-in-left' : ''}`}>🤪🫣</p>
            <p className={`text right ${animate ? 'slide-in-right' : ''}`}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            
        </div>
    );
};

export default Test;