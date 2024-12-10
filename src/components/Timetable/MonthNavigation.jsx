import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';

function MonthNavigation(props) {
  const isPrevDisabled = () => {
    return false; // Allow navigation to previous months
  };

  const isNextDisabled = () => {
    if (!props.maxDate) return false;
    const currentYear = props.currentMonth.getFullYear();
    const currentMonth = props.currentMonth.getMonth();
    const maxYear = props.maxDate.getFullYear();
    const maxMonth = props.maxDate.getMonth();
    return (
      currentYear > maxYear ||
      (currentYear === maxYear && currentMonth >= maxMonth)
    );
  };

  const formatMonthYear = () => {
    return props.currentMonth.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div class="flex items-center justify-between mt-4 w-full mx-auto">
      <button
        class={`flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
          isPrevDisabled() ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={props.handlePrevMonth}
        disabled={isPrevDisabled()}
      >
        <Icon path={chevronLeft} class="w-4 h-4 sm:w-6 sm:h-6 inline-block" />
        <span class="ml-1 text-sm sm:text-base">Previous</span>
      </button>

      <div class="text-base sm:text-lg font-semibold">
        {formatMonthYear()}
      </div>

      <button
        class={`flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
          isNextDisabled() ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={props.handleNextMonth}
        disabled={isNextDisabled()}
      >
        <span class="mr-1 text-sm sm:text-base">Next</span>
        <Icon path={chevronRight} class="w-4 h-4 sm:w-6 sm:h-6 inline-block" />
      </button>
    </div>
  );
}

export default MonthNavigation;