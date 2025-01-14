import { useState, useEffect } from 'react';
import { fetchTimetable, fetchExams, fetchPreferences } from '../api';

function useData(user) {
  const [timetable, setTimetable] = useState(null);
  const [exams, setExams] = useState([]);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      if (timetable || exams.length > 0 || preferences) return; // Prevent refetching if data exists
      try {
        console.log('[INFO] Fetching data for user:', user?.id);

        const examData = await fetchExams();
        setExams(examData);

        const timetableData = await fetchTimetable();
        setTimetable(timetableData);

        const prefData = await fetchPreferences();
        setPreferences(prefData);

      } catch (err) {
        console.error('Error loading data in useData:', err);
      }
    };

    loadData();
  }, [user, timetable, exams, preferences]);

  return { timetable, exams, preferences, setTimetable, setExams };
}

export default useData;