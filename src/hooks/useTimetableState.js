import { createSignal, createEffect } from 'solid-js';
import { useTimetable } from '../contexts/TimetableContext';
import { isSameDay } from 'date-fns';

function useTimetableState() {
  const { preferences, currentMonth, setCurrentMonth } = useTimetable();
  const [selectedDate, setSelectedDate] = createSignal(null);

  createEffect(() => {
    if (currentMonth() === null && preferences() && preferences().startDate) {
      const startDate = new Date(preferences().startDate);
      setCurrentMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    }
  });

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      if (preferences() && preferences().startDate) {
        const minMonth = new Date(preferences().startDate);
        minMonth.setDate(1); // Set to first day of the month
        if (newMonth < minMonth) {
          return prev; // Do not update if newMonth is before startDate month
        }
      }
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
    if (selectedDate() && isSameDay(selectedDate(), date)) {
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