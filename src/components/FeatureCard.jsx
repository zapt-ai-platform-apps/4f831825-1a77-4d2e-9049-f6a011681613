import React from 'react';

function FeatureCard({ title }) {
  return (
    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-lg border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
      <div className="w-12 h-12 bg-cyan-500/20 rounded-lg mb-4 flex items-center justify-center">
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
    </div>
  );
}

export default FeatureCard;