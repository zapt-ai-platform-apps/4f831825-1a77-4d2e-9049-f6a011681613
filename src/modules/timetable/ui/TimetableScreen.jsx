import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTimetable } from './useTimetable';
import { TimetableProvider } from './TimetableContext';
import CalendarGrid from './CalendarGrid';
import DayDetails from './DayDetails';
import ExportTimetable from './ExportTimetable';
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
    refreshTimetable,
    preferences
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

  const hasTimetableData = Object.keys(datesWithData).length > 0;

  return (
    <div className="container mx-auto px-1 sm:px-4 py-2 sm:py-4 max-w-full">
      <TimetableProvider 
        value={{ 
          datesWithData, 
          subjectColours, 
          preferences,
          refreshTimetable
        }}
      >
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
        
        {/* Export functionality */}
        {hasTimetableData && (
          <ExportTimetable 
            datesWithData={datesWithData} 
            subjectColours={subjectColours} 
          />
        )}
        
        <div className="text-center mt-2">
          <Link 
            to="/timetable-logic" 
            className="text-secondary hover:text-secondary/90 text-xs underline"
          >
            How is my timetable generated?
          </Link>
        </div>
      </TimetableProvider>
    </div>
  );
}

export default TimetableScreen;