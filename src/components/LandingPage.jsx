import { Link } from '@solidjs/router';

function LandingPage() {
  return (
    <div class="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
      <h1 class="text-3xl sm:text-5xl font-bold mb-6 text-center">Welcome to UpGrade</h1>
      <p class="text-lg sm:text-xl mb-8 text-center max-w-2xl">
        UpGrade is a personalized revision timetable app designed to help you efficiently prepare for your examinations. Get started now to create your custom study schedule!
      </p>
      <Link
        href="/login"
        class="px-8 py-4 bg-white text-[#004AAD] rounded-full shadow-lg hover:bg-opacity-90 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
      >
        Get Started
      </Link>
    </div>
  );
}

export default LandingPage;