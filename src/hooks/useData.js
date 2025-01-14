import { useState, useEffect } from 'react';
import { fetchTimetable, fetchExams, fetchPreferences } from '../api';

function useData(user) {
  const [timetable, setTimetable] = useState(null);
  const [exams, setExams] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  async function fetchAllUserData() {
    try {
      console.log('[INFO] Fetching data for user:', user?.id);

      const examData = await fetchExams();
      setExams(examData);

      const timetableData = await fetchTimetable();
      setTimetable(timetableData);

      const prefData = await fetchPreferences();
      setPreferences(prefData);

      setHasFetched(true);
    } catch (err) {
      console.error('Error loading data in useData:', err);
    }
  }

  useEffect(() => {
    if (!user) return;
    if (hasFetched) return;
    fetchAllUserData();
  }, [user, hasFetched]);

  async function refetchExams() {
    try {
      console.log('[INFO] Re-fetching exams...');
      const examData = await fetchExams();
      setExams(examData);
    } catch (err) {
      console.error('Error re-fetching exams in useData:', err);
    }
  }

  return { timetable, setTimetable, exams, setExams, preferences, refetchExams };
}

export default useData;