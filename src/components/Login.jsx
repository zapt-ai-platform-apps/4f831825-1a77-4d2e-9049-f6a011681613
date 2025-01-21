import React from 'react';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-foreground/5 rounded-xl backdrop-blur-lg border border-border">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-foreground">Sign in with ZAPT</h2>
          <a
            href="https://www.zapt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Secure authentication powered by ZAPT
          </a>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#06b6d4',
                  brandAccent: '#0891b2',
                  inputText: '#ffffff',
                  inputBackground: '#1e293b',
                  inputBorder: '#334155',
                  inputLabelText: '#94a3b8',
                  messageText: '#e2e8f0',
                },
              },
            },
          }}
          providers={['google', 'facebook', 'apple']}
          magicLink={true}
          showLinks={false}
          view="magic_link"
        />
      </div>
    </div>
  );
}

export default Login;