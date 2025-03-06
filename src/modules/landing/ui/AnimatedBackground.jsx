import React from 'react';

/**
 * Animated background component
 * @returns {React.ReactElement} Animated background
 */
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
}

export default AnimatedBackground;