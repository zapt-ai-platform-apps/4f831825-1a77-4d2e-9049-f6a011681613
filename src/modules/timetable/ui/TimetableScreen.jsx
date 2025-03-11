import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTimetable } from './useTimetable';
import { TimetableProvider } from './TimetableContext';
import CalendarGrid from './CalendarGrid';
import DayDetails from './DayDetails';
import LoadingOverlay from '../../../shared/components/LoadingOverlay';
import PeriodAvailabilityModal from './PeriodAvailabilityModal';

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
    preferences,
    periodAvailability
  } = useTimetable();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch timetable data once on mount with empty dependency array
  // This prevents the infinite refresh loop
  useEffect(() => {
    console.log("TimetableScreen mounted, refreshing timetable data...");
    refreshTimetable();
  }, []); // Empty dependency array ensures this only runs once on mount

  const openAvailabilityModal = () => {
    setIsModalOpen(true);
  };

  const closeAvailabilityModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <LoadingOverlay message="Loading your timetable..." />;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="container mx-auto px-1 sm:px-4 py-2 sm:py-4 max-w-full">
      <TimetableProvider 
        value={{ 
          datesWithData, 
          subjectColours, 
          preferences,
          periodAvailability,
          refreshTimetable
        }}
      >
        <div className="text-right mb-2">
          <button
            onClick={openAvailabilityModal}
            className="text-sm bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary px-3 py-1.5 rounded cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/30"
          >
            Set Period Availability
          </button>
        </div>
        
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
        
        <div className="text-center mt-2">
          <Link 
            to="/timetable-logic" 
            className="text-secondary hover:text-secondary/90 text-xs underline"
          >
            How is my timetable generated?
          </Link>
        </div>
        
        {isModalOpen && (
          <PeriodAvailabilityModal
            onClose={closeAvailabilityModal}
            onSave={refreshTimetable}
            existingPeriods={periodAvailability || []}
          />
        )}
      </TimetableProvider>
    </div>
  );
}

export default TimetableScreen;