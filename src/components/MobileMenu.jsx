import { Link } from '@solidjs/router';

function MobileMenu(props) {
  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-3/4 max-w-xs relative">
        <button
          class="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={() => props.setMenuOpen(false)}
        >
          &times;
        </button>
        <nav class="flex flex-col space-y-4">
          <Link
            href="/preferences"
            class="text-xl text-blue-600 hover:underline cursor-pointer"
            classList={{ 'font-bold': props.location.pathname === '/preferences' }}
            onClick={() => props.setMenuOpen(false)}
          >
            Preferences
          </Link>
          <Link
            href="/exams"
            class="text-xl text-blue-600 hover:underline cursor-pointer"
            classList={{ 'font-bold': props.location.pathname === '/exams' }}
            onClick={() => props.setMenuOpen(false)}
          >
            Exams
          </Link>
          <Link
            href="/timetable"
            class="text-xl text-blue-600 hover:underline cursor-pointer"
            classList={{ 'font-bold': props.location.pathname === '/timetable' }}
            onClick={() => props.setMenuOpen(false)}
          >
            Timetable
          </Link>
          <button
            class="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={() => {
              props.handleSignOut();
              props.setMenuOpen(false);
            }}
          >
            Sign Out
          </button>
        </nav>
      </div>
    </div>
  );
}

export default MobileMenu;