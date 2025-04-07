import React from 'react';
import ExamItems from './ExamItems';
import SessionItems from './SessionItems';

/**
 * Calendar day component
 * @param {Object} props - Component props
 * @param {Date} props.day - Day date
 * @param {Object} props.hasData - Data for this day
 * @param {Date} props.selectedDate - Selected date
 * @param {Function} props.onDateClick - Date click handler
 * @param {Object} props.subjectColours - Subject color mapping
 * @returns {React.ReactElement} Calendar day
 */
function CalendarDay({ day, hasData, selectedDate, onDateClick, subjectColours }) {
  const isSelected =
    selectedDate && new Date(selectedDate).toDateString() === day.toDateString();

  const blockOrder = ['Morning', 'Afternoon', 'Evening'];

  // Organize items by time block
  const getItemsByBlock = () => {
    if (!hasData) return {};
    
    // Create object to store items by block
    const blockItems = {
      Morning: { exams: [], sessions: [] },
      Afternoon: { exams: [], sessions: [] },
      Evening: { exams: [], sessions: [] }
    };
    
    // Categorize exams by time of day
    if (hasData.exams) {
      hasData.exams.forEach(exam => {
        const block = exam.timeOfDay || 'Morning';
        blockItems[block].exams.push(exam);
      });
    }
    
    // Categorize sessions by block
    if (hasData.sessions) {
      hasData.sessions.forEach(session => {
        blockItems[session.block].sessions.push(session);
      });
    }
    
    return blockItems;
  };
  
  const itemsByBlock = getItemsByBlock();

  return (
    <div
      className={`relative border border-gray-200 dark:border-gray-700 cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 ${
        isSelected ? 'border-2 border-primary ring-2 ring-primary/20 dark:ring-primary/40' : ''
      } min-h-[50px] md:min-h-[60px] p-0.5`}
      onClick={() => onDateClick(day)}
    >
      <div className="absolute top-0.5 left-0.5 font-sans font-semibold text-xs text-gray-700 dark:text-gray-300">
        {day.getDate()}
      </div>
      
      {hasData && (
        <div className="mt-3 md:mt-4 px-0.5 flex flex-col h-[calc(100%-16px)]">
          {blockOrder.map(block => (
            <div 
              key={block} 
              className={`mb-0.5 ${block !== 'Morning' ? 'mt-auto' : ''}`}
            >
              {itemsByBlock[block]?.exams.length > 0 && (
                <ExamItems exams={itemsByBlock[block].exams} />
              )}
              {itemsByBlock[block]?.sessions.length > 0 && (
                <SessionItems 
                  sortedSessions={itemsByBlock[block].sessions} 
                  subjectColours={subjectColours} 
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CalendarDay;