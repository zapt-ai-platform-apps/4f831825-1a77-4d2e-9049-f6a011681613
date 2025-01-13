import { useState, useEffect } from 'react';
import { fetchTimetable, fetchExams, fetchPreferences } from '../api';

function useData(user) {
  const [timetable, setTimetable] = useState(null);
  const [exams, setExams] = useState([]);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTimetable(setTimetable);
      fetchExams(setExams);
      fetchPreferences(setPreferences);
    }
  }, [user]);

  return { timetable, exams, preferences };
}

export default useData;