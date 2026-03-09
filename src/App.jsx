import { useState, useEffect } from 'react';
import { flashcards as deck } from './data.js';
import Flashcard from './Flashcard.jsx';
import Quiz from './Quiz.jsx';
import SentenceBuilder from './SentenceBuilder.jsx';
import './Flashcard.css';

function App() {
  const [cards, setCards] = useState(deck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState('flashcard'); // 'flashcard', 'quiz', or 'sentence'

  // --- Voice Pronunciation ---
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any previous speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Find a Japanese voice
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(voice => voice.lang.startsWith('ja'));
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support text-to-speech.");
    }
  };

  // Pre-load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);


  // Shuffle cards
  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Handle navigation
  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };
  
  // Reset deck to original order
  const resetDeck = () => {
    setCards(deck);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  // Allow keyboard navigation in flashcard mode
  useEffect(() => {
    if (mode !== 'flashcard') return;

    const handleKeydown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped(f => !f);
      }
      if (e.key === 's') {
        e.preventDefault();
        handleSpeak(cards[currentIndex].japanese);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [cards, currentIndex, mode]);


  return (
    <div className="container">
      <header>
        <h1>Japanese Flashcards</h1>
        <p>Learn vocabulary from your lessons!</p>
        
        <div className="mode-selector">
          <button className={mode === 'flashcard' ? 'active' : ''} onClick={() => setMode('flashcard')}>Flashcard</button>
          <button className={mode === 'quiz' ? 'active' : ''} onClick={() => setMode('quiz')}>Quiz</button>
          <button className={mode === 'sentence' ? 'active' : ''} onClick={() => setMode('sentence')}>Sentence Builder</button>
        </div>
      </header>
      
      {mode === 'flashcard' && (
        <>
          <p className="card-counter">{currentIndex + 1} / {cards.length}</p>
          <Flashcard 
            card={cards[currentIndex]} 
            isFlipped={isFlipped} 
            onFlip={() => setIsFlipped(!isFlipped)} 
            onSpeak={() => handleSpeak(cards[currentIndex].japanese)}
          />
          <div className="navigation-buttons">
            <button onClick={handlePrev}>&larr; Previous</button>
            <button onClick={handleNext}>Next &rarr;</button>
          </div>
          <div className="utility-buttons">
            <button onClick={shuffleCards}>Shuffle Deck</button>
            <button onClick={resetDeck}>Reset Deck</button>
          </div>
        </>
      )}

      {mode === 'quiz' && (
        <Quiz 
          flashcards={deck} 
          onSpeak={(text) => handleSpeak(text)} 
        />
      )}

      {mode === 'sentence' && (
        <SentenceBuilder 
          flashcards={deck} 
          onSpeak={(text) => handleSpeak(text)} 
        />
      )}
    </div>
  );
}

export default App;
