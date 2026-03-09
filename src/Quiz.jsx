import React, { useState, useEffect, useCallback } from 'react';
import './Quiz.css';

const Quiz = ({ flashcards, onSpeak }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [allScores, setAllScores] = useState({}); // { [cardId]: { right: 0, wrong: 0 } }
  const [availableIds, setAvailableIds] = useState([]);

  // Load scores from localStorage on mount
  useEffect(() => {
    const savedScores = localStorage.getItem('quiz_per_card_scores');
    if (savedScores) {
      try {
        setAllScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Failed to parse scores", e);
        setAllScores({});
      }
    }
  }, []);

  // Initialize or reset the pool of available cards
  const resetPool = useCallback(() => {
    const ids = flashcards.map(c => c.id);
    const shuffledIds = [...ids].sort(() => Math.random() - 0.5);
    setAvailableIds(shuffledIds);
    return shuffledIds;
  }, [flashcards]);

  // Generate a new question
  const generateQuestion = useCallback((providedIds) => {
    if (!flashcards || flashcards.length < 4) return;

    // Safety check: ignore first arg if it's a React Event object
    let currentPool = (Array.isArray(providedIds)) ? providedIds : availableIds;
    
    // If pool is empty, reset it
    if (currentPool.length === 0) {
      currentPool = resetPool();
    }

    // Pick the first ID from the shuffled pool
    const nextId = currentPool[0];
    const questionCard = flashcards.find(c => c.id === nextId);

    if (!questionCard) {
      const freshPool = resetPool();
      generateQuestion(freshPool);
      return;
    }

    // Pick 3 random distractors
    let distractors = flashcards
      .filter(card => card.id !== questionCard.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Combine correct answer + distractors and shuffle
    const quizOptions = [
      { id: questionCard.id, text: questionCard.english, isCorrect: true },
      ...distractors.map(d => ({ id: d.id, text: d.english, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    setCurrentQuestion(questionCard);
    setOptions(quizOptions);
    setSelectedOption(null);
    setIsAnswered(false);
    
    // Update pool: remove the ID we just used
    setAvailableIds(currentPool.slice(1));
  }, [flashcards, availableIds, resetPool]);

  // Initial question generation
  useEffect(() => {
    if (availableIds.length === 0 && !currentQuestion) {
      const initialPool = resetPool();
      generateQuestion(initialPool);
    }
  }, [availableIds.length, currentQuestion, resetPool, generateQuestion]);

  const handleOptionSelect = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const cardId = currentQuestion.id;
    const currentCardScore = allScores[cardId] || { right: 0, wrong: 0 };
    
    const updatedScores = { ...allScores };
    if (option.isCorrect) {
      updatedScores[cardId] = { ...currentCardScore, right: currentCardScore.right + 1 };
      onSpeak(currentQuestion.japanese);
    } else {
      updatedScores[cardId] = { ...currentCardScore, wrong: currentCardScore.wrong + 1 };
    }
    
    setAllScores(updatedScores);
    localStorage.setItem('quiz_per_card_scores', JSON.stringify(updatedScores));

    // Auto-advance after 1.5 seconds if they got it right
    if (option.isCorrect) {
      setTimeout(() => {
        generateQuestion();
      }, 1500);
    }
  };

  const handleResetScore = () => {
    if (window.confirm("Are you sure you want to reset ALL card statistics?")) {
      setAllScores({});
      localStorage.removeItem('quiz_per_card_scores');
    }
  };

  if (!currentQuestion) return <div>Loading quiz...</div>;

  const totalCards = flashcards.length;
  const cardsSeen = totalCards - availableIds.length;
  const currentStats = allScores[currentQuestion.id] || { right: 0, wrong: 0 };

  return (
    <div className="quiz-container">
      <p className="quiz-progress">Progress: {cardsSeen} / {totalCards}</p>
      <div className="quiz-card">
        <div className="quiz-question">
          <button className="speak-button-quiz" onClick={() => onSpeak(currentQuestion.japanese)} title="Listen">🔊</button>
          <h2 className="romaji-word">{currentQuestion.romaji}</h2>
          <p className="japanese-text">({currentQuestion.japanese})</p>
        </div>

        <div className="quiz-options">
          {options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                isAnswered 
                  ? (option.isCorrect ? 'correct' : (selectedOption?.text === option.text ? 'incorrect' : '')) 
                  : ''
              }`}
              onClick={() => handleOptionSelect(option)}
              disabled={isAnswered}
            >
              {option.text}
            </button>
          ))}
        </div>

        {isAnswered && (!selectedOption || !selectedOption.isCorrect) && (
          <button className="next-question-btn" onClick={() => generateQuestion()}>
            Next Question
          </button>
        )}
      </div>

      <div className="quiz-score-board">
        <div className="score-item">
          <span className="score-label">Word Correct</span>
          <span className="score-value right">{currentStats.right}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Word Wrong</span>
          <span className="score-value wrong">{currentStats.wrong}</span>
        </div>
        <div className="score-item">
          <button className="reset-score-btn" onClick={handleResetScore} title="Reset All Statistics">
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
