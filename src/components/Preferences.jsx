import { createSignal, onMount, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

function Preferences() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = createSignal({
    revisionTimes: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    sessionDuration: 60,
    startDate: '',
  });
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  const timeBlocks = [
    { label: 'Morning', times: ['9:00', '10:00', '11:00', '12:00'] },
    { label: 'Afternoon', times: ['14:00', '15:00', '16:00', '17:00'] },
    { label: 'Evening', times: ['18:00', '19:00', '20:00', '21:00'] },
  ];

  onMount(() => {
    // Fetch existing preferences
    fetchPreferences();
  });

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/getPreferences', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        if (data) {
          setPreferences(data);
        }
      } else {
        // Preferences not found or error occurred
        if (response.status !== 404) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error fetching preferences');
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSelection = (day, blockLabel) => {
    const dayTimes = preferences().revisionTimes[day];
    const block = timeBlocks.find(b => b.label === blockLabel);
    const hasBlock = block.times.every(time => dayTimes.includes(time));

    if (hasBlock) {
      // Remove the block times
      setPreferences({
        ...preferences(),
        revisionTimes: {
          ...preferences().revisionTimes,
          [day]: dayTimes.filter((t) => !block.times.includes(t)),
        },
      });
    } else {
      // Add the block times
      setPreferences({
        ...preferences(),
        revisionTimes: {
          ...preferences().revisionTimes,
          [day]: [...dayTimes, ...block.times.filter((t) => !dayTimes.includes(t))],
        },
      });
    }
  };

  const handleDurationChange = (e) => {
    setPreferences({ ...preferences(), sessionDuration: parseInt(e.target.value) });
  };

  const handleStartDateChange = (e) => {
    setPreferences({ ...preferences(), startDate: e.target.value });
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/savePreferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: preferences() }),
      });

      const responseBody = await response.text();

      if (!response.ok) {
        let errorText = 'Error saving preferences';
        try {
          const errorData = JSON.parse(responseBody);
          errorText = errorData.error || errorText;
        } catch (e) {
          errorText = responseBody || errorText;
        }
        throw new Error(errorText);
      }

      navigate('/exams');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Sentry.captureException(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex flex-col text-white">
      <div class="flex-grow p-4 flex items-center justify-center">
        <div class="w-full max-w-full sm:max-w-4xl bg-white/90 rounded-lg p-6 shadow-lg text-black">
          <h2 class="text-2xl font-bold mb-4">Set Your Revision Preferences</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold mb-2">Available Revision Times</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <For each={Object.keys(preferences().revisionTimes)}>
                  {(day) => (
                    <div>
                      <h4 class="font-semibold mb-1 capitalize">{day}</h4>
                      <div class="flex flex-wrap gap-2">
                        <For each={timeBlocks}>
                          {(block) => (
                            <button
                              class={`px-3 py-1 rounded-full cursor-pointer ${
                                block.times.every((time) => preferences().revisionTimes[day].includes(time))
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}
                              onClick={() => handleBlockSelection(day, block.label)}
                            >
                              {block.label}
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Session Duration</h3>
              <select
                value={preferences().sessionDuration}
                onInput={handleDurationChange}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border"
              >
                <For each={[30, 45, 60, 75, 90, 105, 120]}>
                  {(duration) => (
                    <option value={duration}>
                      {Math.floor(duration / 60)}h {duration % 60 !== 0 ? `${duration % 60}min` : ''}
                    </option>
                  )}
                </For>
              </select>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Start Date</h3>
              <input
                type="date"
                value={preferences().startDate}
                onInput={handleStartDateChange}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border"
              />
            </div>
            <Show when={error()}>
              <p class="text-red-500">{error()}</p>
            </Show>
            <button
              class={`w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                loading() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
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

export default Preferences;