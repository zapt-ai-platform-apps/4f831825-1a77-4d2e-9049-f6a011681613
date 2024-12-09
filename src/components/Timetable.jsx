import { createSignal, createEffect, Show } from 'solid-js';
import { useTimetable } from '../contexts/TimetableContext';
import MonthNavigation from './MonthNavigation';
import CalendarGrid from './Timetable/CalendarGrid';
import DayDetails from './Timetable/DayDetails';
import { isSameDay } from 'date-fns';
import { useTimetableData } from '../hooks/useTimetableData';

function Timetable() {
  const { preferences } = useTimetable();
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [selectedDate, setSelectedDate] = createSignal(null);

  const {
    loading,
    error,
    datesWithData,
    maxDate,
    subjectColours,
    fetchData,
  } = useTimetableData(currentMonth, setCurrentMonth);

  createEffect(() => {
    if (preferences() && preferences().startDate) {
      const startDate = new Date(preferences().startDate);
      setCurrentMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
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

  return (
    <div class="h-full flex flex-col text-white p-4">
      <div class="w-full max-w-screen-xl mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-center">Your Revision Timetable</h2>
        <Show when={!loading()} fallback={<p>Loading...</p>}>
          <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
            <MonthNavigation
              currentMonth={currentMonth()}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              maxDate={maxDate()}
            />
            <CalendarGrid
              currentMonth={currentMonth()}
              datesWithData={datesWithData()}
              selectedDate={selectedDate()}
              onDateClick={handleDateClick}
              subjectColours={subjectColours()}
            />
            <Show when={selectedDate()}>
              <DayDetails
                date={selectedDate()}
                datesWithData={datesWithData()}
                subjectColours={subjectColours()}
              />
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default Timetable;