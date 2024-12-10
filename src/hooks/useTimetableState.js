import { createSignal, createEffect } from 'solid-js';
import { useTimetable } from '../contexts/TimetableContext';
import { isSameDay } from 'date-fns';

function useTimetableState() {
  const { preferences } = useTimetable();
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [selectedDate, setSelectedDate] = createSignal(null);

  createEffect(() => {
    if (preferences() && preferences().startDate) {
      const startDate = new Date(preferences().startDate);
      setCurrentMonth(() => new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    }
  });

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
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