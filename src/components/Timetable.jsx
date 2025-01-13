import React from 'react';
import useTimetableData from './Timetable/useTimetableData';
import MonthNavigation from './Timetable/MonthNavigation';
import CalendarGrid from './Timetable/CalendarGrid';
import DayDetails from './Timetable/DayDetails';

function Timetable() {
  const {
    currentMonth,
    setCurrentMonth,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
    loading,
    error,
    datesWithData,
    maxDate,
    subjectColours,
    refreshTimetableData,
  } = useTimetableData();

  return (
    <div className="flex flex-col text-white h-full">
      <div className="w-screen h-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Revision Timetable</h2>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center">Loading...</p>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <MonthNavigation
              currentMonth={currentMonth}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              maxDate={maxDate}
              minDate={preferences && preferences.startDate ? new Date(preferences.startDate) : null}
            />
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