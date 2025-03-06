import { usePreferencesState } from '../internal/state';

/**
 * Hook for accessing preferences state and actions in UI components
 * @returns {Object} Preferences state and actions
 */
export function usePreferences() {
  const preferencesState = usePreferencesState();
  
  // Return public API only
  return {
    preferences: preferencesState.preferences,
    loading: preferencesState.loading,
    saving: preferencesState.saving,
    error: preferencesState.error,
    handleBlockTimesChange: preferencesState.handleBlockTimesChange,
    handleBlockSelection: preferencesState.handleBlockSelection,
    handleStartDateChange: preferencesState.handleStartDateChange,
    savePreferences: preferencesState.handleSave
  };
}