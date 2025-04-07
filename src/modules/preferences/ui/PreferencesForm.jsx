import React from 'react';
import BlockTimeForm from './BlockTimeForm';
import RevisionTimesSelector from './RevisionTimesSelector';
import StartDatePicker from './StartDatePicker';

/**
 * Form for setting preferences
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Preferences form
 */
function PreferencesForm({
  preferences,
  loading,
  error,
  handleSave,
  handleBlockTimesChange,
  handleBlockSelection,
  handleStartDateChange,
  showCalendarButton,
  onShowCalendar
}) {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <RevisionTimesSelector
          revisionTimes={preferences.revisionTimes}
          onBlockSelection={handleBlockSelection}
        />
        
        {/* Availability Calendar Button - always visible but conditionally enabled */}
        <div className="flex justify-center mt-4 relative group">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              showCalendarButton 
                ? "bg-secondary text-white hover:bg-secondary/90 cursor-pointer" 
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            onClick={showCalendarButton ? onShowCalendar : undefined}
            disabled={!showCalendarButton}
            aria-label="Customize Day-Specific Availability"
          >
            Customize Day-Specific Availability
          </button>
          
          {/* Tooltip that appears on hover when button is disabled */}
          {!showCalendarButton && (
            <div className="absolute invisible group-hover:visible bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
              Enter exam info and/or revision start date to access custom availability
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">
          Set Block Times
        </h3>
        <BlockTimeForm
          blockTimes={preferences.blockTimes}
          onChange={handleBlockTimesChange}
        />
      </div>
      
      <StartDatePicker
        startDate={preferences.startDate}
        onChange={handleStartDateChange}
      />
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      <button
        className={`btn w-full px-6 py-3 mt-4 cursor-pointer ${
          loading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary text-white dark:bg-primary dark:text-white'
        } transition duration-300 ease-in-out transform hover:scale-105 rounded-lg`}
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}

export default PreferencesForm;