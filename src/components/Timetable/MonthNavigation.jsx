import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';

function MonthNavigation(props) {
  const isPrevDisabled = () => {
    if (!props.minDate) return false;
    const prevMonth = new Date(props.currentMonth.getFullYear(), props.currentMonth.getMonth() - 1, 1);
    const minMonth = new Date(props.minDate.getFullYear(), props.minDate.getMonth(), 1);
    return prevMonth < minMonth;
  };

  const isNextDisabled = () => {
    if (!props.maxDate) return false;
    const nextMonth = new Date(props.currentMonth.getFullYear(), props.currentMonth.getMonth() + 1, 1);
    const maxMonth = new Date(props.maxDate.getFullYear(), props.maxDate.getMonth(), 1);
    return nextMonth > maxMonth;
  };

  const formatMonthYear = () => {
    return props.currentMonth.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div class="mt-4 mb-4 w-full mx-auto">
      <div class="flex flex-col sm:flex-row items-center justify-between">
        <button
          class={`flex items-center px-4 py-2 mb-2 sm:mb-0 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            isPrevDisabled()
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={props.handlePrevMonth}
          disabled={isPrevDisabled()}
        >
          <Icon path={chevronLeft} class="w-6 h-6 inline-block" />
          <span class="ml-1">Previous</span>
        </button>
        <div class="text-lg font-semibold mx-4 my-2 sm:my-0 text-center text-white">
          {formatMonthYear()}
        </div>
        <button
          class={`flex items-center px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            isNextDisabled()
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={props.handleNextMonth}
          disabled={isNextDisabled()}
        >
          <span class="mr-1">Next</span>
          <Icon path={chevronRight} class="w-6 h-6 inline-block" />
        </button>
      </div>
    </div>
  );
}

export default MonthNavigation;