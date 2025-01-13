import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePreferences from '../hooks/usePreferences';
import PreferencesForm from './PreferencesForm';

function Preferences() {
  const navigate = useNavigate();
  const {
    preferences,
    setPreferences,
    loading,
    error,
    handleSavePreferences,
    handleBlockTimesChange,
  } = usePreferences(navigate);

  return (
    <div className="h-full flex flex-col text-white">
      <div className="flex-grow p-4 flex items-center justify-center">
        <div className="w-full max-w-full sm:max-w-4xl bg-white/90 rounded-lg p-6 shadow-lg text-black">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Set Your Revision Preferences
          </h2>
          <div className="space-y-6">
            <PreferencesForm
              preferences={preferences}
              setPreferences={setPreferences}
              loading={loading}
              error={error}
              handleSavePreferences={handleSavePreferences}
              handleBlockTimesChange={handleBlockTimesChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preferences;