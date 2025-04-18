import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferencesState } from '../internal/state';
import { api as examsApi } from '../../exams/api';
import PreferencesForm from './PreferencesForm';
import AvailabilityCalendar from './AvailabilityCalendar';
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
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasExams, setHasExams] = useState(false);
  const [checkingExams, setCheckingExams] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if user has exams to determine whether to show the calendar button
  useEffect(() => {
    const checkExams = async () => {
      try {
        setCheckingExams(true);
        const exams = await examsApi.getExams();
        setHasExams(Array.isArray(exams) && exams.length > 0);
      } catch (error) {
        console.error('Error checking exams:', error);
      } finally {
        setCheckingExams(false);
      }
    };

    checkExams();
  }, []);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSavePreferences = async () => {
    const result = await handleSave();
    if (result.success) {
      // Stay on preferences screen instead of navigating to exams
      setSaveSuccess(true);
    }
  };

  // Show calendar button condition - user has start date and exams
  const showCalendarButton = !loading && !checkingExams && preferences?.startDate && hasExams;

  return (
    <div className="min-h-screen flex flex-col text-gray-800 dark:text-gray-200">
      {saving && <LoadingOverlay message="Saving Preferences..." />}
      {loading && !saving && <LoadingOverlay message="Loading your preferences..." />}

      <div className="flex-grow p-4 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-full sm:max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
            {showCalendar ? 'Customize Your Availability Calendar' : 'Set Your Revision Preferences'}
          </h2>
          
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-md text-center transition-opacity">
              Preferences saved successfully!
            </div>
          )}
          
          {!loading && !showCalendar && (
            <div className="space-y-6">
              <PreferencesForm
                preferences={preferences}
                loading={saving}
                error={error}
                handleSave={handleSavePreferences}
                handleBlockTimesChange={handleBlockTimesChange}
                handleBlockSelection={handleBlockSelection}
                handleStartDateChange={handleStartDateChange}
                showCalendarButton={showCalendarButton}
                onShowCalendar={() => setShowCalendar(true)}
              />
              
              {hasExams && (
                <div className="flex justify-center mt-6">
                  <button
                    className="btn px-6 py-2 cursor-pointer bg-secondary text-white hover:bg-secondary/90 transition duration-300 rounded-lg"
                    onClick={() => navigate('/exams')}
                  >
                    Continue to Exams
                  </button>
                </div>
              )}
            </div>
          )}
          
          {!loading && showCalendar && (
            <div className="space-y-6">
              <AvailabilityCalendar 
                preferences={preferences} 
                onSave={() => {
                  navigate('/exams');
                }}
              />
              
              <div className="flex justify-between">
                <button
                  className="btn px-6 py-3 cursor-pointer bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition duration-300 rounded-lg"
                  onClick={() => setShowCalendar(false)}
                >
                  Back to General Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreferencesScreen;