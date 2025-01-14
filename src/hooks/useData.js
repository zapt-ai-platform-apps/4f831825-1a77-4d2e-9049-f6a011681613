import { useState, useEffect } from 'react';
import { fetchTimetable, fetchExams, fetchPreferences } from '../api';

function useData(user) {
  const [timetable, setTimetable] = useState(null);
  const [exams, setExams] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [hasFetched, setHasFetched] = useState(false); // Added flag to prevent multiple fetches

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      if (hasFetched) return; // Prevent refetching if data has already been fetched
      try {
        console.log('[INFO] Fetching data for user:', user?.id);

        const examData = await fetchExams();
        setExams(examData);

        const timetableData = await fetchTimetable();
        setTimetable(timetableData);

        const prefData = await fetchPreferences();
        setPreferences(prefData);
        
        setHasFetched(true); // Mark as fetched

      } catch (err) {
        console.error('Error loading data in useData:', err);
      }
    };

    loadData();
  }, [user, hasFetched]); // Updated dependencies

  return { timetable, exams, preferences, setTimetable, setExams };
}

export default useData;