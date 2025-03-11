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
  handleStartDateChange
}) {
  return (
    <div className="space-y-12">
      <RevisionTimesSelector
        revisionTimes={preferences.revisionTimes}
        onBlockSelection={handleBlockSelection}
      />
      
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