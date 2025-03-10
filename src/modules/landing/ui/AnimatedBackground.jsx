import React from 'react';

/**
 * Animated background component with improved effects
 * @returns {React.ReactElement} Animated background
 */
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Primary gradient blur */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]"></div>
      
      {/* Secondary gradient blur */}
      <div className="absolute bottom-0 right-1/4 w-3/4 h-1/2 bg-secondary/5 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]"></div>
      
      {/* Accent smaller blobs */}
      <div className="absolute top-1/3 right-1/5 w-32 h-32 bg-accent/5 rounded-full blur-[50px] animate-[pulse_6s_ease-in-out_infinite_1s]"></div>
      <div className="absolute bottom-1/4 left-1/5 w-48 h-48 bg-secondary/5 rounded-full blur-[70px] animate-[pulse_7s_ease-in-out_infinite_3s]"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + i}s ease-in-out infinite ${i}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default AnimatedBackground;