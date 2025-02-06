import React from 'react';
import useTimetableData from './Timetable/useTimetableData';
import CalendarGrid from './Timetable/CalendarGrid';
import DayDetails from './Timetable/DayDetails';
import { useTimetable } from '../contexts/TimetableContext';

function Timetable() {
  const {
    currentMonth,
    selectedDate,
    handleDateClick,
    loading,
    error,
    datesWithData,
    maxDate,
    subjectColours,
    refreshTimetableData,
  } = useTimetableData();

  const { preferences } = useTimetable();

  return (
    <div className="flex flex-col text-white h-full font-handwriting">
      <div className="w-screen h-full mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center">Loading...</p>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="mt-4">
              <CalendarGrid
                currentMonth={currentMonth}
                datesWithData={datesWithData}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
                subjectColours={subjectColours}
              />
            </div>
            <div className="md:hidden">
              {selectedDate && (
                <DayDetails
                  date={selectedDate}
                  datesWithData={datesWithData}
                  subjectColours={subjectColours}
                  refreshTimetableData={refreshTimetableData}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Timetable;