import React from 'react';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-md p-8 space-y-6 bg-foreground/5 rounded-2xl backdrop-blur-lg border-2 border-primary/30 fun-shadow">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-primary">Welcome to UpGrade! 🎉</h2>
          <p className="text-muted-foreground">Let's get you signed in</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#FF6B6B',
                  brandAccent: '#FF4757',
                  inputText: '#ffffff',
                  inputBackground: '#2d3436',
                  inputBorder: '#4ECDC4',
                  inputLabelText: '#dfe6e9',
                  messageText: '#FFE66D',
                },
                radii: {
                  borderRadiusButton: '12px',
                  buttonBorderRadius: '12px',
                  inputBorderRadius: '12px',
                }
              },
            },
          }}
          providers={['google', 'facebook', 'apple']}
          magicLink={true}
          showLinks={false}
          view="magic_link"
        />
        
        <div className="text-center text-muted-foreground">
          <span className="mr-2">Powered by</span>
          <a
            href="https://www.zapt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-secondary font-medium"
          >
            ZAPT ⚡
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;