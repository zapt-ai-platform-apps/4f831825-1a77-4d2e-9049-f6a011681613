import React, { useState } from 'react';
import * as Sentry from '@sentry/browser';
import ExamListItem from './ExamListItem';

/**
 * Component for displaying a list of exams
 * @param {Object} props - Component props
 * @param {Array} props.exams - Array of exam objects
 * @param {Function} props.onExamDeleted - Callback when exam is deleted
 * @param {Function} props.onEditExam - Callback when exam is edited
 * @returns {React.ReactElement} Exam list
 */
function ExamList({ exams = [], onExamDeleted, onEditExam }) {
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  
  const handleDelete = async (id) => {
    try {
      await onExamDeleted(id);
    } catch (error) {
      console.error('Error deleting exam:', error);
      Sentry.captureException(error);
    }
  };

  const filteredExams = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    switch(filter) {
      case 'upcoming':
        return exams.filter(exam => new Date(exam.examDate) >= today);
      case 'past':
        return exams.filter(exam => new Date(exam.examDate) < today);
      default:
        return exams;
    }
  }, [exams, filter]);

  return (
    <div className="h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Exams</h3>
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button 
            className={`px-3 py-1 text-sm rounded-full transition cursor-pointer ${filter === 'all' ? 'bg-primary text-white dark:bg-primary dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            onClick={() => setFilter('all')}
          >
            All Exams
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full transition cursor-pointer ${filter === 'upcoming' ? 'bg-primary text-white dark:bg-primary dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full transition cursor-pointer ${filter === 'past' ? 'bg-primary text-white dark:bg-primary dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            onClick={() => setFilter('past')}
          >
            Past
          </button>
        </div>
      </div>
      
      {filteredExams.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          {filter === 'all' 
            ? 'No exams added yet' 
            : filter === 'upcoming' 
              ? 'No upcoming exams found' 
              : 'No past exams found'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => (
            <ExamListItem
              key={exam.id}
              exam={exam}
              onEdit={onEditExam}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamList;