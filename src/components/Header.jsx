import { Link } from '@solidjs/router';

function Header(props) {
  return (
    <header class="flex items-center justify-between mb-8 p-4">
      <h1 class="text-4xl font-bold">UpGrade</h1>
      <div class="sm:hidden">
        <button
          class="text-white cursor-pointer focus:outline-none"
          onClick={() => props.setMenuOpen(true)}
        >
          &#9776;
        </button>
      </div>
      <nav class="hidden sm:flex space-x-4">
        <Link
          href="/preferences"
          class="hover:underline cursor-pointer"
          classList={{ 'font-bold': props.location.pathname === '/preferences' }}
        >
          Preferences
        </Link>
        <Link
          href="/exams"
          class="hover:underline cursor-pointer"
          classList={{ 'font-bold': props.location.pathname === '/exams' }}
        >
          Exams
        </Link>
        <Link
          href="/timetable"
          class="hover:underline cursor-pointer"
          classList={{ 'font-bold': props.location.pathname === '/timetable' }}
        >
          Timetable
        </Link>
        <button
          class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
          onClick={props.handleSignOut}
        >
          Sign Out
        </button>
      </nav>
    </header>
  );
}

export default Header;