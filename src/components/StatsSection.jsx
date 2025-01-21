import React from 'react';

function StatsSection() {
  return (
    <div className="mt-16 flex justify-center gap-12 text-center">
      <div className="border-r border-white/20 pr-12">
        <div className="text-3xl font-bold text-cyan-400">95%</div>
        <div className="text-gray-300">Success Rate</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-purple-400">10k+</div>
        <div className="text-gray-300">Students Empowered</div>
      </div>
    </div>
  );
}

export default StatsSection;