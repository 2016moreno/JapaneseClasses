import React, { useState, useEffect } from 'react';
import './App.css';
import { vocabulary } from './data';

function App() {
  const [activeTab, setActiveTab] = useState('quiz');

  return (
    <div className="app-container">
      <header>
        <h1>Japanese Builder</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'quiz' ? 'active' : ''} 
            onClick={() => setActiveTab('quiz')}>
            Flashcard Quiz
          </button>
          <button 
            className={activeTab === 'sentences' ? 'active' : ''} 
            onClick={() => setActiveTab('sentences')}>
            Sentence Builder
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'quiz' ? <QuizView /> : <SentenceBuilder />}
      </main>
    </div>
  );
}

function QuizView() {
  const [currentCard, setCurrentCard] = useState(vocabulary[0]);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  // Text-to-Speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  // Generate new question
  const loadNewCard = () => {
    const randomIndex = Math.floor(Math.random() * vocabulary.length);
    const correctWord = vocabulary[randomIndex];
    
    // Get 3 random wrong answers
    const wrongOptions = vocabulary
      .filter(w => w.id !== correctWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Combine and shuffle
    const allOptions = [...wrongOptions, correctWord].sort(() => 0.5 - Math.random());
    
    setCurrentCard(correctWord);
    setOptions(allOptions);
    setFeedback(null);
  };

  useEffect(() => {
    loadNewCard();
  }, []);

  const handleAnswer = (selectedWord) => {
    if (feedback) return; // Prevent clicking after answered

    if (selectedWord.id === currentCard.id) {
      setFeedback('correct');
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      setStreak(prev => prev + 1);
      speak(currentCard.japanese);
    } else {
      setFeedback('incorrect');
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
      setStreak(0);
    }
  };

  return (
    <div className="quiz-container">
      <div className="quiz-stats">
        <span>Score: {score.correct} / {score.total}</span>
        <span>Streak: {streak > 0 ? `🔥 ${streak}` : '0'}</span>
      </div>

      <div className="flashcard">
        <button className="audio-btn" onClick={() => speak(currentCard.japanese)}>🔊</button>
        <div className="romaji-text">{currentCard.romaji}</div>
        <div className="japanese-text">({currentCard.japanese})</div>
      </div>

      <p className="quiz-instruction">Select the correct English meaning:</p>

      <div className="options-grid">
        {options.map((opt) => (
          <button 
            key={opt.id} 
            className={`option-btn ${feedback && opt.id === currentCard.id ? 'correct' : ''} ${feedback === 'incorrect' && opt.id !== currentCard.id ? 'dim' : ''}`}
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}
          >
            {opt.english}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="feedback-area">
          <p className={feedback}>{feedback === 'correct' ? 'Correct! 🎉' : `Oops! It was "${currentCard.english}"`}</p>
          <button className="next-btn" onClick={loadNewCard}>Next Word ➡</button>
        </div>
      )}
    </div>
  );
}

function SentenceBuilder() {
  const [sentence, setSentence] = useState([]);

  const addToSentence = (word) => {
    setSentence([...sentence, word]);
  };

  const removeFromSentence = (index) => {
    const newSentence = [...sentence];
    newSentence.splice(index, 1);
    setSentence(newSentence);
  };

  const speakSentence = () => {
    // Combine the Japanese parts
    const text = sentence.map(w => w.japanese.split(' ')[0]).join(''); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="builder-container">
      <div className="sentence-display">
        <h3>Your Sentence:</h3>
        <div className="sentence-strip">
          {sentence.length === 0 && <span className="placeholder">Click words below to build a sentence...</span>}
          {sentence.map((word, idx) => (
            <span key={idx} className="sentence-word" onClick={() => removeFromSentence(idx)}>
              <span className="s-romaji">{word.romaji}</span>
              <span className="s-jp">{word.japanese.split(' ')[0]}</span>
            </span>
          ))}
        </div>
        <div className="translation-preview">
          Meaning: {sentence.map(w => w.english).join(' + ')}
        </div>
        <div className="controls">
            <button onClick={speakSentence} disabled={sentence.length === 0}>🔊 Speak Sentence</button>
            <button onClick={() => setSentence([])} className="clear-btn">Clear</button>
        </div>
      </div>

      <div className="word-bank">
        <h3>Word Bank</h3>
        <div className="bank-grid">
          {vocabulary.map(word => (
            <button key={word.id} className="bank-item" onClick={() => addToSentence(word)}>
              <div className="bank-romaji">{word.romaji}</div>
              <div className="bank-eng">{word.english}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;