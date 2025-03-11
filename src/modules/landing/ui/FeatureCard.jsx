import React from 'react';

/**
 * Feature card component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.title - Feature title
 * @param {string} props.description - Feature description
 * @returns {React.ReactElement} Feature card
 */
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-primary/20 hover:border-accent transition-all duration-300 hover:translate-y-[-5px]">
      <div className="text-3xl mb-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

export default FeatureCard;