import React from 'react';

/**
 * Timetable mockup component showing a preview of the app's timetable view
 * @returns {React.ReactElement} Timetable mockup
 */
function TimetableMockup() {
  return (
    <div className="relative max-w-md w-full">
      {/* Device frame */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-100 dark:border-gray-700 transform rotate-2 transition-transform duration-500 hover:rotate-0">
        {/* App header */}
        <div className="bg-primary text-white p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">UpGrade Timetable</h3>
            <div className="text-sm bg-white/20 rounded-full px-3 py-1">June 2025</div>
          </div>
        </div>
        
        {/* Calendar view */}
        <div className="p-4 dark:bg-gray-800">
          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400">{day}</div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: 30 }).map((_, i) => {
              // Add some visual variety to the calendar
              const hasEvent = [3, 7, 12, 15, 19, 23, 27].includes(i);
              const isToday = i === 10;
              
              return (
                <div 
                  key={i} 
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg ${
                    isToday 
                      ? 'bg-primary text-white font-bold' 
                      : hasEvent 
                        ? 'bg-secondary/20 dark:bg-secondary/30 font-medium dark:text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          
          {/* Study sessions */}
          <div className="space-y-3">
            <div className="text-sm font-semibold dark:text-white">Today's Sessions</div>
            {/* Example study sessions */}
            <div className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-lg border-l-4 border-secondary">
              <div className="text-xs font-medium text-secondary dark:text-secondary">9:00 AM - 10:30 AM</div>
              <div className="font-medium dark:text-white">Mathematics</div>
            </div>
            <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg border-l-4 border-primary">
              <div className="text-xs font-medium text-primary dark:text-primary">1:00 PM - 2:30 PM</div>
              <div className="font-medium dark:text-white">Biology</div>
            </div>
            <div className="bg-accent/10 dark:bg-accent/20 p-3 rounded-lg border-l-4 border-accent">
              <div className="text-xs font-medium text-accent-foreground dark:text-accent">4:00 PM - 5:30 PM</div>
              <div className="font-medium dark:text-white">Chemistry</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shadow and reflection effect */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/5 to-transparent -z-10 blur-md dark:from-black/10" />
      
      {/* Decorative elements */}
      <div className="absolute -right-4 -top-4 w-12 h-12 bg-accent/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse" />
    </div>
  );
}

export default TimetableMockup;