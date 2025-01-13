import React from 'react';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
      <div className="w-full max-w-md p-8 bg-white/80 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#004AAD]">Sign in with ZAPT</h2>
        <a
          href="https://www.zapt.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-800 hover:underline mb-6 block text-center cursor-pointer"
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
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}

export default Login;