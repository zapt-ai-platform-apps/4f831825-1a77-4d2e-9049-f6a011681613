import React from 'react';
import { format } from 'date-fns';
import { isSameDay } from 'date-fns';
import SessionsList from './SessionsList';

function DayCell({ day, datesWithData, isSelected, onDateClick, subjectColours }) {
  const dateKey = format(day, 'yyyy-MM-dd');
  const dataForDay = datesWithData[dateKey] || { sessions: [], exams: [] };

  return (
    <div
      className={`relative border border-white cursor-pointer hover:bg-gray-700 hover:bg-opacity-25 transition duration-200 ease-in-out ${
        isSelected() ? 'border-2 border-yellow-500' : ''
      } min-h-[60px] sm:min-h-[150px]`}
      onClick={() => onDateClick(day)}
    >
      <div className="absolute top-1 left-1 font-bold text-xs sm:text-base text-white">
        {format(day, 'd')}
      </div>
      {dataForDay.exams.length > 0 && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 sm:hidden"></div>
      )}
      <div className="mt-5 sm:mt-10">
        {dataForDay.exams.length > 0 && (
          <div className="hidden sm:block mb-2 px-1">
            {dataForDay.exams.map((exam) => (
              <div
                key={exam.id}
                className="mb-1 p-2 rounded-lg text-white cursor-pointer"
                style={{ backgroundColor: '#FF0000' }}
              >
                <div className="font-bold text-base">Exam: {exam.subject}</div>
                <div className="text-sm">Time of Day: {exam.timeOfDay || 'Morning'}</div>
              </div>
            ))}
          </div>
        )}
        <SessionsList sortedSessions={dataForDay.sessions} subjectColours={subjectColours} />
      </div>
    </div>
  );
}

export default DayCell;