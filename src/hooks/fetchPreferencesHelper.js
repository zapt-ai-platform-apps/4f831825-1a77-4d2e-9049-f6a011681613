export const fetchPreferencesHelper = async (
  supabase,
  getPreferences,
  setLoading,
  setPreferences,
  preferences,
  Sentry
) => {
  setLoading(true);
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await getPreferences(session);

    if (response.ok) {
      const { data } = await response.json();
      if (data && data.revisionTimes) {
        const validBlocks = ['Morning', 'Afternoon', 'Evening'];
        const newRevisionTimes = {};
        Object.keys(preferences.revisionTimes).forEach((day) => {
          const dayBlocks = data.revisionTimes[day] || [];
          newRevisionTimes[day] = dayBlocks.filter((block) =>
            validBlocks.includes(block)
          );
        });

        const newBlockTimes = { ...preferences.blockTimes };
        if (data.blockTimes) {
          for (const block of validBlocks) {
            if (data.blockTimes[block]) {
              newBlockTimes[block] = {
                startTime: data.blockTimes[block].startTime,
                endTime: data.blockTimes[block].endTime,
              };
            }
          }
        }

        setPreferences({
          revisionTimes: newRevisionTimes,
          startDate: data.startDate || '',
          blockTimes: newBlockTimes,
        });
      } else {
        setPreferences({
          ...preferences,
          startDate: data ? data.startDate || '' : preferences.startDate,
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