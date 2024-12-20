import { Show } from 'solid-js';
import useTimetableState from '../hooks/useTimetableState';
import { useTimetableData } from '../hooks/useTimetableData';
import MonthNavigation from './Timetable/MonthNavigation';
import CalendarGrid from './Timetable/CalendarGrid';
import DayDetails from './Timetable/DayDetails';
import { useTimetable } from '../contexts/TimetableContext';

function Timetable() {
  const {
    currentMonth,
    setCurrentMonth,
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
  } = useTimetableData(currentMonth, setCurrentMonth);

  const { preferences } = useTimetable();

  return (
    <div class="flex flex-col text-white h-full">
      <div class="w-screen h-full">
        <h2 class="text-2xl font-bold mb-4 text-center">Your Revision Timetable</h2>
        <Show when={!loading()} fallback={
          <div class="flex items-center justify-center h-full">
            <p class="text-center">Loading...</p>
          </div>
        }>
          <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
            <MonthNavigation
              currentMonth={currentMonth()}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              maxDate={maxDate()}
              minDate={preferences() && preferences().startDate ? new Date(preferences().startDate) : null}
            />
            <div class="mt-4">
              <CalendarGrid
                currentMonth={currentMonth()}
                datesWithData={datesWithData}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
                subjectColours={subjectColours}
              />
            </div>
            <div class="md:hidden">
              <Show when={selectedDate()}>
                <DayDetails
                  date={selectedDate()}
                  datesWithData={datesWithData}
                  subjectColours={subjectColours}
                  refreshTimetableData={refreshTimetableData}
                />
              </Show>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default Timetable;