export const savePreferencesHelper = async ({
  supabase,
  savePreferences,
  generateTimetable,
  fetchTimetable,
  setTimetable,
  preferences,
  setError,
  setLoading,
  navigate,
  Sentry,
}) => {
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

    // Fetch the new timetable before navigating
    const newTimetableData = await fetchTimetable(session);
    setTimetable(newTimetableData);

    navigate('/timetable');
  } catch (error) {
    console.error('Error saving preferences:', error);
    Sentry.captureException(error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};