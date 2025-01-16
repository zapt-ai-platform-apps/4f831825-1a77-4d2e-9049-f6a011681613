import React from 'react';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-primary to-lightBlue text-white">
      <div className="card w-full max-w-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Sign in with ZAPT</h2>
        <a
          href="https://www.zapt.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline mb-6 block text-center cursor-pointer"
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