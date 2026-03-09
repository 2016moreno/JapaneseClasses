import React, { useState, useMemo, useEffect } from 'react';
import './SentenceBuilder.css';

const SentenceBuilder = ({ flashcards, onSpeak }) => {
  const [selectedWords, setSelectedWords] = useState(() => {
    // Load draft from localStorage on initial load
    const savedDraft = localStorage.getItem('sentence_builder_draft');
    if (savedDraft) {
      try {
        const ids = JSON.parse(savedDraft);
        // Map IDs back to full card objects
        return ids.map(id => flashcards.find(c => c.id === id)).filter(Boolean);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Save draft to localStorage whenever selectedWords changes
  useEffect(() => {
    const ids = selectedWords.map(w => w.id);
    localStorage.setItem('sentence_builder_draft', JSON.stringify(ids));
  }, [selectedWords]);

  // Group vocabulary by category
  const categories = useMemo(() => {
    const groups = {};
    flashcards.forEach(card => {
      // Skip the "Sentence" category cards themselves for the word grid
      if (card.category === 'Sentences') return;
      
      if (!groups[card.category]) {
        groups[card.category] = [];
      }
      groups[card.category].push(card);
    });
    return groups;
  }, [flashcards]);

  // Predefined Sentence Patterns
  const patterns = useMemo(() => {
    return flashcards.filter(card => card.category === 'Sentences');
  }, [flashcards]);

  const addWord = (card) => {
    setSelectedWords([...selectedWords, card]);
  };

  const removeWord = (index) => {
    const newWords = [...selectedWords];
    newWords.splice(index, 1);
    setSelectedWords(newWords);
  };

  const clearSentence = () => {
    setSelectedWords([]);
  };

  const usePattern = (pattern) => {
    // For now, patterns are just single objects, we can "build" them by setting them
    // as the first item or special state. 
    // Let's just add the pattern as a "word" for now, or clear and add it.
    setSelectedWords([pattern]);
  };

  const builtJapanese = selectedWords.map(w => w.japanese).join(' ');
  const builtRomaji = selectedWords.map(w => w.romaji).join(' ');
  const builtEnglish = selectedWords.map(w => w.english).join(' ');

  return (
    <div className="sentence-builder-container">
      <div className="sentence-display-area">
        {selectedWords.length > 0 ? (
          <>
            <div className="selected-chips-container">
              {selectedWords.map((word, index) => (
                <div key={`${word.id}-${index}`} className="selected-word-bubble">
                  <span className="bubble-text">{word.romaji}</span>
                  <button 
                    className="remove-word-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWord(index);
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button className="speak-sentence-btn" onClick={() => onSpeak(builtJapanese)}>🔊</button>
            <h2 className="display-romaji">{builtRomaji}</h2>
            <p className="display-japanese">({builtJapanese})</p>
            <p className="display-english">{builtEnglish}</p>
          </>
        ) : (
          <p className="empty-sentence-msg">Select words below to build your sentence...</p>
        )}
      </div>

      <div className="builder-actions">
        <button className="clear-btn" onClick={clearSentence} disabled={selectedWords.length === 0}>Clear All</button>
      </div>

      <div className="builder-controls">
        <section>
          <h3 className="section-title">Common Patterns</h3>
          <div className="patterns-grid">
            {patterns.map(pattern => (
              <div key={pattern.id} className="pattern-card" onClick={() => usePattern(pattern)}>
                <span className="pattern-jp">{pattern.romaji}</span>
                <span className="pattern-en">{pattern.english}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="section-title">Vocabulary Words</h3>
          <div className="word-categories">
            {Object.entries(categories).map(([category, words]) => (
              <div key={category} className="category-group">
                <span className="category-label">{category}</span>
                <div className="word-grid">
                  {words.map(word => (
                    <button 
                      key={word.id} 
                      className="word-chip"
                      onClick={() => addWord(word)}
                    >
                      {word.romaji} ({word.japanese})
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SentenceBuilder;
