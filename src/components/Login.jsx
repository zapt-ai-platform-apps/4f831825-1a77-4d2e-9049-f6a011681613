import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function Login() {
  return (
    <div class="flex items-center justify-center h-full bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
      <div class="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
        <h2 class="text-3xl font-bold mb-6 text-center text-white">Sign in with ZAPT</h2>
        <a
          href="https://www.zapt.ai"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-200 hover:underline mb-6 block text-center cursor-pointer"
        >
          Learn more about ZAPT
        </a>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'facebook', 'apple']}
          magicLink={true}
          showLinks={false}
          view="magic_link"
          class="cursor-pointer"
        />
      </div>
    </div>
  );
}

export default Login;