import { useState, useEffect } from 'react';
import { flashcards as deck } from './data.js';
import Flashcard from './Flashcard.jsx';
import Quiz from './Quiz.jsx';
import SentenceBuilder from './SentenceBuilder.jsx';
import './Flashcard.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('is_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [cards, setCards] = useState(deck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState('flashcard'); // 'flashcard', 'quiz', or 'sentence'

  // --- Voice Pronunciation ---
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(voice => voice.lang.startsWith('ja'));
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support text-to-speech.");
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_APP_PASSWORD;
    
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('is_auth', 'true');
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container login-gate" style={{ marginTop: '100px', textAlign: 'center' }}>
        <h1>🔒 Private Class</h1>
        <p>Please enter the password to continue.</p>
        <form onSubmit={handleLogin} style={{ maxWidth: '300px', margin: '0 auto' }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #444', 
              marginBottom: '15px', 
              width: '100%',
              backgroundColor: '#1a1a1a',
              color: 'white'
            }}
          />
          <button type="submit" style={{ width: '100%', backgroundColor: '#646cff' }}>Enter</button>
        </form>
      </div>
    );
  }

  // --- Original App Logic ---
  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };
  
  const resetDeck = () => {
    setCards(deck);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  useEffect(() => {
    if (mode !== 'flashcard' || !isAuthenticated) return;

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
  }, [cards, currentIndex, mode, isAuthenticated]);


  return (
    <div className="container">
      <header>
        <h1>Japanese Flashcards</h1>
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
