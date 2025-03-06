import React from 'react';
import { useTimetable } from './useTimetable';
import { TimetableProvider } from './TimetableContext';
import CalendarGrid from './CalendarGrid';
import DayDetails from './DayDetails';
import MonthNavigation from './MonthNavigation';
import LoadingOverlay from '../../../shared/components/LoadingOverlay';

/**
 * Main timetable screen component
 * @returns {React.ReactElement} Timetable screen
 */
function TimetableScreen() {
  const {
    loading,
    error,
    datesWithData,
    subjectColours,
    currentMonth,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
    minDate,
    maxDate
  } = useTimetable();

  if (loading) {
    return <LoadingOverlay message="Loading your timetable..." />;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-full">
      <div className="flex justify-center mb-4">
        <MonthNavigation
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
      
      <TimetableProvider value={{ datesWithData, subjectColours }}>
        <CalendarGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
        />
        
        {selectedDate && (
          <DayDetails
            date={selectedDate}
            datesWithData={datesWithData}
            subjectColours={subjectColours}
          />
        )}
      </TimetableProvider>
    </div>
  );
}

export default TimetableScreen;