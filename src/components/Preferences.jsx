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
    startDate: '',
  });
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  const timeBlocks = ['Morning', 'Afternoon', 'Evening'];

  onMount(() => {
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
        if (data && data.revisionTimes) {
          const validBlocks = ['Morning', 'Afternoon', 'Evening'];
          const newRevisionTimes = {};
          Object.keys(preferences().revisionTimes).forEach((day) => {
            const dayBlocks = data.revisionTimes[day] || [];
            newRevisionTimes[day] = dayBlocks.filter((block) =>
              validBlocks.includes(block)
            );
          });
          setPreferences({
            revisionTimes: newRevisionTimes,
            startDate: data.startDate || '',
          });
        } else {
          setPreferences({
            ...preferences(),
            startDate: data ? data.startDate || '' : preferences().startDate,
          });
        }
      } else {
        if (response.status !== 404) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error fetching preferences');
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSelection = (day, block) => {
    const dayBlocks = preferences().revisionTimes[day] || [];
    const hasBlock = dayBlocks.includes(block);

    if (hasBlock) {
      setPreferences({
        ...preferences(),
        revisionTimes: {
          ...preferences().revisionTimes,
          [day]: dayBlocks.filter((b) => b !== block),
        },
      });
    } else {
      setPreferences({
        ...preferences(),
        revisionTimes: {
          ...preferences().revisionTimes,
          [day]: [...dayBlocks, block],
        },
      });
    }
  };

  const handleStartDateChange = (e) => {
    setPreferences({ ...preferences(), startDate: e.target.value });
  };

  const handleSavePreferences = async () => {
    setError(null);

    if (!preferences().startDate) {
      setError('Please select a start date.');
      return;
    }

    const hasAtLeastOneBlockSelected = Object.values(preferences().revisionTimes).some(
      (dayBlocks) => dayBlocks.length > 0
    );

    if (!hasAtLeastOneBlockSelected) {
      setError('Please select at least one revision time.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const validBlocks = ['Morning', 'Afternoon', 'Evening'];
      const filteredRevisionTimes = {};
      Object.keys(preferences().revisionTimes).forEach((day) => {
        const dayBlocks = preferences().revisionTimes[day];
        filteredRevisionTimes[day] = dayBlocks.filter((block) =>
          validBlocks.includes(block)
        );
      });

      const filteredPreferences = {
        revisionTimes: filteredRevisionTimes,
        startDate: preferences().startDate,
      };

      const response = await fetch('/api/savePreferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: filteredPreferences }),
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

      const generateResponse = await fetch('/api/generateTimetable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        throw new Error(errorText || 'Error generating timetable');
      }

      navigate('/timetable');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Sentry.captureException(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="h-full flex flex-col text-white">
      <div class="flex-grow p-4 flex items-center justify-center">
        <div class="w-full max-w-full sm:max-w-4xl bg-white/90 rounded-lg p-6 shadow-lg text-black">
          <h2 class="text-2xl font-bold mb-4 text-center">Set Your Revision Preferences</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold mb-2 text-center">Available Revision Times</h3>
              <Show when={preferences().revisionTimes}>
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
                                  preferences().revisionTimes[day].includes(block)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                                }`}
                                onClick={() => handleBlockSelection(day, block)}
                              >
                                {block}
                              </button>
                            )}
                          </For>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2 text-center">Start Date</h3>
              <input
                type="date"
                value={preferences().startDate}
                onInput={handleStartDateChange}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border cursor-pointer"
              />
            </div>
            <Show when={error()}>
              <p class="text-red-500 text-center">{error()}</p>
            </Show>
            <p class="text-red-500 text-center">
              Note: Saving new preferences will clear your existing preferences and timetable. Your exams will remain unchanged.
            </p>
            <button
              class={`w-full px-6 py-3 ${
                loading() ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
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

export default Preferences;