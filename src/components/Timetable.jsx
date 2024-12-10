import { Show } from 'solid-js';
import useTimetableState from '../hooks/useTimetableState';
import { useTimetableData } from '../hooks/useTimetableData';
import MonthNavigation from './MonthNavigation';
import CalendarGrid from './Timetable/CalendarGrid';
import DayDetails from './Timetable/DayDetails';

function Timetable() {
  const {
    currentMonth,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
  } = useTimetableState();

  const {
    loading,
    error,
    datesWithData,
    maxDate,
    subjectColours,
    refreshTimetableData,
  } = useTimetableData(currentMonth, selectedDate);

  return (
    <div class="h-full flex flex-col text-white p-4">
      <div class="w-full max-w-screen-xl mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-center">Your Revision Timetable</h2>
        <Show when={!loading()} fallback={<p>Loading...</p>}>
          <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
            <MonthNavigation
              currentMonth={currentMonth}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              maxDate={maxDate}
            />
            <CalendarGrid
              currentMonth={currentMonth}
              datesWithData={datesWithData}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              subjectColours={subjectColours}
            />
            <Show when={selectedDate()}>
              <DayDetails
                date={selectedDate}
                datesWithData={datesWithData}
                subjectColours={subjectColours}
                refreshTimetableData={refreshTimetableData}
              />
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default Timetable;