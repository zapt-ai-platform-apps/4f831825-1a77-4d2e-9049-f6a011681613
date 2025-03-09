import React, { useEffect } from 'react';
import { useTimetable } from './useTimetable';
import { TimetableProvider } from './TimetableContext';
import CalendarGrid from './CalendarGrid';
import DayDetails from './DayDetails';
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
    maxDate,
    refreshTimetable
  } = useTimetable();

  // Fetch timetable data once on mount with empty dependency array
  // This prevents the infinite refresh loop
  useEffect(() => {
    console.log("TimetableScreen mounted, refreshing timetable data...");
    refreshTimetable();
  }, []); // Empty dependency array ensures this only runs once on mount

  if (loading) {
    return <LoadingOverlay message="Loading your timetable..." />;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="container mx-auto px-1 sm:px-4 py-4 sm:py-8 max-w-full">
      <TimetableProvider value={{ datesWithData, subjectColours, preferences: {} }}>
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