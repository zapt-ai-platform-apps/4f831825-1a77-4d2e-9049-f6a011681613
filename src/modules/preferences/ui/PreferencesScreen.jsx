import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferencesState } from '../internal/state';
import PreferencesForm from './PreferencesForm';
import LoadingOverlay from '../../../shared/components/LoadingOverlay';

/**
 * Preferences screen component
 * @returns {React.ReactElement} Preferences screen
 */
function PreferencesScreen() {
  const navigate = useNavigate();
  const {
    preferences,
    loading,
    saving,
    error,
    handleBlockTimesChange,
    handleBlockSelection,
    handleStartDateChange,
    handleSave,
  } = usePreferencesState();

  const handleSavePreferences = async () => {
    const result = await handleSave();
    if (result.success) {
      navigate('/exams');
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      {saving && <LoadingOverlay message="Saving Preferences..." />}
      {loading && !saving && <LoadingOverlay message="Loading your preferences..." />}

      <div className="flex-grow p-4 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-full sm:max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
            Set Your Revision Preferences
          </h2>
          
          {!loading && (
            <div className="space-y-6">
              <PreferencesForm
                preferences={preferences}
                loading={saving}
                error={error}
                handleSave={handleSavePreferences}
                handleBlockTimesChange={handleBlockTimesChange}
                handleBlockSelection={handleBlockSelection}
                handleStartDateChange={handleStartDateChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreferencesScreen;