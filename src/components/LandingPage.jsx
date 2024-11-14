import { Link } from '@solidjs/router';

function LandingPage() {
  return (
    <div class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 class="text-5xl font-bold mb-6 text-white text-center">Welcome to UpGrade</h1>
      <p class="text-xl mb-8 text-center max-w-2xl">
        UpGrade is a personalized revision timetable app designed to help you efficiently prepare for your examinations. Get started now to create your custom study schedule!
      </p>
      <Link
        href="/login"
        class="px-8 py-4 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
      >
        Get Started
      </Link>
    </div>
  );
}

export default LandingPage;