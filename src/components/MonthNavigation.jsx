import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';
import { format } from 'date-fns';

function MonthNavigation(props) {
  const isPrevDisabled = () => {
    const minMonth = props.minDate ? format(props.minDate, 'yyyy-MM') : null;
    const current = format(props.currentMonth, 'yyyy-MM');
    return minMonth && current <= minMonth;
  };

  const isNextDisabled = () => {
    const maxMonth = props.maxDate ? format(props.maxDate, 'yyyy-MM') : null;
    const current = format(props.currentMonth, 'yyyy-MM');
    return maxMonth && current >= maxMonth;
  };

  return (
    <div class="flex items-center justify-between mt-4 w-full sm:w-96 md:w-[32rem] lg:w-[36rem] mx-auto">
      <button
        class={`flex items-center px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
          isPrevDisabled() ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={props.handlePrevMonth}
        disabled={isPrevDisabled()}
      >
        <Icon path={chevronLeft} class="w-6 h-6 inline-block" />
        <span class="ml-1">Previous</span>
      </button>
      <button
        class={`flex items-center px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
          isNextDisabled() ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={props.handleNextMonth}
        disabled={isNextDisabled()}
      >
        <span class="mr-1">Next</span>
        <Icon path={chevronRight} class="w-6 h-6 inline-block" />
      </button>
    </div>
  );
}

export default MonthNavigation;