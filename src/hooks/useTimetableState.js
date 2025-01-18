import { useState, useEffect } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { isSameDay } from 'date-fns';

function useTimetableState() {
  const { preferences, currentMonth, setCurrentMonth } = useTimetable();
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (currentMonth === null && preferences && preferences.startDate) {
      const startDate = new Date(preferences.startDate);
      setCurrentMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    }
  }, [currentMonth, preferences, setCurrentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      // Removed the check against preferences.startDate to allow navigation to any previous month
      return newMonth;
    });
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return newMonth;
    });
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    if (selectedDate && isSameDay(selectedDate, date)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  return {
    currentMonth,
    setCurrentMonth,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
  };
}

export default useTimetableState;