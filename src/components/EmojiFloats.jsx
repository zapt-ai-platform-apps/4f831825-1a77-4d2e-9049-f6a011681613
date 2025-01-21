import React from 'react';

const EMOJIS = ['📚', '🎓', '⭐', '🤓', '💡', '🏆', '🎉', '✨'];

function EmojiFloats() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {EMOJIS.map((emoji, index) => (
        <div
          key={index}
          className="absolute text-4xl opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${6 + index * 2}s infinite ${index * 0.5}s ease-in-out`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}

export default EmojiFloats;