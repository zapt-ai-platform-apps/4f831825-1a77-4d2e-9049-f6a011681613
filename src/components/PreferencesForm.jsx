import { Show } from 'solid-js';
import BlockTimeForm from './BlockTimeForm';
import AvailableRevisionTimes from './AvailableRevisionTimes';
import StartDatePicker from './StartDatePicker';

function PreferencesForm(props) {
  const {
    preferences,
    setPreferences,
    loading,
    error,
    handleSavePreferences,
    handleBlockTimesChange,
  } = props;

  return (
    <div class="h-full flex flex-col text-white">
      <div class="flex-grow p-4 flex items-center justify-center">
        <div class="w-full max-w-full sm:max-w-4xl bg-white/90 rounded-lg p-6 shadow-lg text-black">
          <h2 class="text-2xl font-bold mb-4 text-center">
            Set Your Revision Preferences
          </h2>
          <div class="space-y-6">
            <AvailableRevisionTimes
              preferences={preferences}
              setPreferences={setPreferences}
            />
            <div>
              <h3 class="text-xl font-semibold mb-2 text-center">
                Set Block Times
              </h3>
              <BlockTimeForm
                blockTimes={preferences().blockTimes}
                onChange={handleBlockTimesChange}
              />
            </div>
            <StartDatePicker
              preferences={preferences}
              setPreferences={setPreferences}
            />
            <Show when={error()}>
              <p class="text-red-500 text-center">{error()}</p>
            </Show>
            <p class="text-red-500 text-center">
              Note: Saving new preferences will clear your existing preferences
              and timetable. Your exams will remain unchanged.
            </p>
            <button
              class={`w-full px-6 py-3 ${
                loading()
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer`}
              onClick={handleSavePreferences}
              disabled={loading()}
            >
              <Show when={loading()} fallback="Save Preferences">
                Saving...
              </Show>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreferencesForm;