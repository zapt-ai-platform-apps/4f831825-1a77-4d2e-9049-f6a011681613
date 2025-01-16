import React from 'react';
import BlockTimeForm from './BlockTimeForm';
import AvailableRevisionTimes from './AvailableRevisionTimes';
import StartDatePicker from './StartDatePicker';

function PreferencesForm({ preferences, setPreferences, loading, error, handleSavePreferences, handleBlockTimesChange }) {
  return (
    <div>
      <AvailableRevisionTimes
        preferences={preferences}
        setPreferences={setPreferences}
      />
      <div>
        <h3 className="text-xl font-semibold mb-2 text-center">
          Set Block Times
        </h3>
        <BlockTimeForm
          blockTimes={preferences.blockTimes}
          onChange={handleBlockTimesChange}
        />
      </div>
      <StartDatePicker
        preferences={preferences}
        setPreferences={setPreferences}
      />
      {error && <p className="text-destructive text-center">{error}</p>}
      <p className="text-destructive text-center">
        Note: Saving new preferences will clear your existing preferences and timetable. Your exams will remain unchanged.
      </p>
      <button
        className={`btn w-full px-6 py-3 mt-4 ${
          loading ? 'bg-primary/50 cursor-not-allowed' : 'btn-primary'
        } transition duration-300 ease-in-out transform hover:scale-105`}
        onClick={handleSavePreferences}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}

export default PreferencesForm;