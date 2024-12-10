import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';

function MonthNavigation(props) {
  const isPrevDisabled = () => {
    // Implement minDate logic here if needed
    return false; // Currently allowing navigation to previous months without restriction
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
    <div class="mt-4 mb-4 w-full mx-auto">
      <div class="flex flex-col items-center">
        <div class="text-lg font-semibold mb-2">
          {formatMonthYear()}
        </div>
        <div class="flex space-x-4">
          <button
            class={`flex items-center px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
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
    </div>
  );
}

export default MonthNavigation;