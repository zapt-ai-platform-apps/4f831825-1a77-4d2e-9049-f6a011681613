import React from 'react';

/**
 * Feature card component
 * @param {Object} props - Component props
 * @param {string} props.emoji - Emoji to display
 * @param {string} props.title - Feature title
 * @param {string} props.description - Feature description
 * @returns {React.ReactElement} Feature card
 */
function FeatureCard({ emoji, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-primary/20 hover:border-accent transition-all duration-300 hover-scale">
      <div className="text-6xl mb-4 animate-float">
        {emoji}
      </div>
      <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default FeatureCard;