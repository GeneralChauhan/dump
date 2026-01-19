// components/AsciiBackground.js
import React from 'react';
import '../style/AsciiBackground.css';

const AsciiBackground = () => {
  const rows = 30;
  const cols = 60;

  const characters = ['/', '-', '\\', '|', ' '];

  const getRandomChar = () =>
    characters[Math.floor(Math.random() * characters.length)];

  const grid = Array.from({ length: rows }, (_, rowIndex) => (
    <div key={rowIndex} className="ascii-row">
      {Array.from({ length: cols }, (_, colIndex) => (
        <span key={colIndex} className="ascii-char">
          {getRandomChar()}
        </span>
      ))}
    </div>
  ));

  return <div className="ascii-background">{grid}</div>;
};

export default AsciiBackground;