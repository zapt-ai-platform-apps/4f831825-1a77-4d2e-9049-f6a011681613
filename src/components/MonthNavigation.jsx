import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';

function MonthNavigation(props) {
  return (
    <div class="flex items-center justify-between mt-4 w-full sm:w-96 md:w-[32rem] lg:w-[36rem] mx-auto">
      <button
        class="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
        onClick={props.handlePrevMonth}
      >
        <Icon path={chevronLeft} class="w-6 h-6 inline-block" />
        <span class="ml-1">Previous</span>
      </button>
      <button
        class="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
        onClick={props.handleNextMonth}
      >
        <span class="mr-1">Next</span>
        <Icon path={chevronRight} class="w-6 h-6 inline-block" />
      </button>
    </div>
  );
}

export default MonthNavigation;