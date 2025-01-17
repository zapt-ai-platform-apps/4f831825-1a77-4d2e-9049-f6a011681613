import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePreferences from '../hooks/usePreferences';
import PreferencesForm from './PreferencesForm';
import LoadingOverlay from './LoadingOverlay';

function Preferences() {
  const navigate = useNavigate();
  const {
    preferences,
    setPreferences,
    loadingPrefs,
    saving,
    error,
    handleSavePreferences,
    handleBlockTimesChange,
  } = usePreferences(navigate);

  return (
    <div className="min-h-screen flex flex-col text-white">
      {saving && <LoadingOverlay message="Saving Preferences..." />}
      {loadingPrefs && !saving && <LoadingOverlay message="Loading your preferences..." />}

      <div className="flex-grow p-4 flex items-center justify-center">
        <div className="card p-6 w-full max-w-full sm:max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Set Your Revision Preferences
          </h2>
          <div className="space-y-6">
            <PreferencesForm
              preferences={preferences}
              setPreferences={setPreferences}
              loading={saving}
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