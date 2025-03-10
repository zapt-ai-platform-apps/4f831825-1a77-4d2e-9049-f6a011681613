import React from 'react';

/**
 * Component for displaying an individual exam item
 * @param {Object} props - Component props
 * @param {Object} props.exam - Exam object
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @returns {React.ReactElement} Exam list item
 */
function ExamListItem({ exam, onEdit, onDelete }) {
  // Check if exam date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
  const isPastExam = new Date(exam.examDate) < today;
  
  return (
    <div className={`bg-white p-4 rounded-lg border ${isPastExam ? 'border-gray-300 opacity-80' : 'border-gray-300'} transition-all hover:border-primary shadow-sm`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: exam.examColour || '#cccccc' }}
            ></span>
            <div className="whitespace-normal flex-1">
              <span className="font-semibold block">{exam.subject}</span>
            </div>
            {isPastExam && 
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                Past Exam
              </span>
            }
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(exam.examDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })} – {exam.timeOfDay}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onEdit(exam)}
            className="px-3 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(exam.id)}
            className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors text-sm cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamListItem;