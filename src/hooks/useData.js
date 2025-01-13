import { useState, useEffect } from 'react';
import { fetchTimetable, fetchExams, fetchPreferences } from '../api';

function useData(user) {
  const [timetable, setTimetable] = useState(null);
  const [exams, setExams] = useState([]);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return;
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
  }, [user]);

  return { timetable, exams, preferences, setTimetable, setExams };
}

export default useData;