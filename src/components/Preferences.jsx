import { Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { usePreferences } from '../hooks/usePreferences';
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
    <Show
      when={!loading()}
      fallback={
        <div class="flex items-center justify-center h-full">
          <div class="text-white text-center">
            <h2 class="text-3xl font-handwriting font-bold mb-4">
              Loading Preferences...
            </h2>
          </div>
        </div>
      }
    >
      <PreferencesForm
        preferences={preferences}
        setPreferences={setPreferences}
        loading={loading}
        error={error}
        handleSavePreferences={handleSavePreferences}
        handleBlockTimesChange={handleBlockTimesChange}
      />
    </Show>
  );
}

export default Preferences;