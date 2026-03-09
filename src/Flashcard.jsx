import React from 'react';
import './Flashcard.css';

const Flashcard = ({ card, isFlipped, onFlip, onSpeak }) => {
  
  const handleSpeakClick = (e) => {
    e.stopPropagation(); // Prevent the card from flipping
    onSpeak();
  };

  return (
    <div className={`card-container ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
      <div className="card front">
        <button className="speak-button" onClick={handleSpeakClick}>🔊</button>
        <p className="card-category">({card.category})</p>
        <h2 className="card-romaji-front">{card.romaji}</h2>
        <p className="card-japanese-sub">({card.japanese})</p>
      </div>
      <div className="card back">
        <h3 className="card-english">{card.english}</h3>
        <p className="card-romaji">({card.romaji})</p>
        {card.example && (
          <div className="card-example">
            <strong>Example:</strong>
            <p>{card.example}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;
