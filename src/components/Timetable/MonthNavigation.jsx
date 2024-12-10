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
    <div class="mt-4 w-full mx-auto">
      <div class="flex flex-col sm:flex-row items-center justify-center sm:justify-between">
        <div class="text-base sm:text-lg font-semibold mb-2 sm:mb-0">
          {formatMonthYear()}
        </div>
        <div class="flex space-x-4">
          <button
            class={`flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg cursor-pointer ${
              isPrevDisabled()
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105 transition duration-300 ease-in-out'
            }`}
            onClick={props.handlePrevMonth}
            disabled={isPrevDisabled()}
          >
            <Icon path={chevronLeft} class="w-4 h-4 sm:w-6 sm:h-6 inline-block" />
            <span class="ml-1 text-sm sm:text-base">Previous</span>
          </button>

          <button
            class={`flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg cursor-pointer ${
              isNextDisabled()
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105 transition duration-300 ease-in-out'
            }`}
            onClick={props.handleNextMonth}
            disabled={isNextDisabled()}
          >
            <span class="mr-1 text-sm sm:text-base">Next</span>
            <Icon path={chevronRight} class="w-4 h-4 sm:w-6 sm:h-6 inline-block" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MonthNavigation;