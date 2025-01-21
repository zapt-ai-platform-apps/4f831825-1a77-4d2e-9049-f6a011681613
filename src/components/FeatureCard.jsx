import React from 'react';

function FeatureCard({ title, description }) {
  return (
    <div className="bg-foreground/5 p-6 rounded-xl backdrop-blur-lg border border-border hover:border-primary/50 transition-all duration-300">
      <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default FeatureCard;