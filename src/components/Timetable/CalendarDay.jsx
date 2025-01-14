import React from 'react';

function CalendarDay({ day, hasData, selectedDate, onDateClick, subjectColours }) {
  const isSelected =
    selectedDate && new Date(selectedDate).toDateString() === day.toDateString();

  return (
    <div
      className={`relative border border-white cursor-pointer hover:bg-gray-700 hover:bg-opacity-25 transition duration-200 ease-in-out ${
        isSelected ? 'border-2 border-yellow-500' : ''
      } min-h-[60px] sm:min-h-[150px]`}
      onClick={() => onDateClick(day)}
    >
      <div className="absolute top-1 left-1 font-bold text-xs sm:text-base text-white">
        {day.getDate()}
      </div>
      {hasData && (
        <>
          {hasData.exams.length > 0 && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 sm:hidden"></div>
          )}
          <div className="mt-5 sm:mt-10">
            {hasData.exams.length > 0 && (
              <div className="hidden sm:block mb-2 px-1">
                {hasData.exams.map((exam) => (
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
            <div className="space-y-2">
              {hasData.sessions.map((session, idx) => (
                <div
                  key={idx}
                  className="p-1 rounded text-xs sm:text-sm cursor-pointer"
                  style={{ backgroundColor: subjectColours[session.subject] || '#ccc' }}
                >
                  {session.subject}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CalendarDay;