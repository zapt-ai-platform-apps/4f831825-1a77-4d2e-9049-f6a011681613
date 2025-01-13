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

export const savePreferencesHelper = async (
  supabase,
  savePreferences,
  generateTimetable,
  preferences,
  setError,
  setLoading,
  navigate,
  Sentry
) => {
  setError(null);

  if (!preferences.startDate) {
    setError('Please select a start date.');
    return;
  }

  const hasAtLeastOneBlockSelected = Object.values(
    preferences.revisionTimes
  ).some((dayBlocks) => dayBlocks.length > 0);

  if (!hasAtLeastOneBlockSelected) {
    setError('Please select at least one revision time.');
    return;
  }

  setLoading(true);
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const validBlocks = ['Morning', 'Afternoon', 'Evening'];
    const filteredRevisionTimes = {};
    Object.keys(preferences.revisionTimes).forEach((day) => {
      const dayBlocks = preferences.revisionTimes[day];
      filteredRevisionTimes[day] = dayBlocks.filter((block) =>
        validBlocks.includes(block)
      );
    });

    const filteredBlockTimes = {};
    validBlocks.forEach((block) => {
      const times = preferences.blockTimes[block];
      if (times && times.startTime && times.endTime) {
        filteredBlockTimes[block] = times;
      }
    });

    const filteredPreferences = {
      revisionTimes: filteredRevisionTimes,
      blockTimes: filteredBlockTimes,
      startDate: preferences.startDate,
    };

    const response = await savePreferences(session, filteredPreferences);
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

    const generateResponse = await generateTimetable(session);
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