import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../core/api';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from './useAuth';

/**
 * Login component using Supabase Auth UI
 */
function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to preferences if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/preferences', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border border-primary/30">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-primary">Welcome to UpGrade! 🎉</h2>
          <p className="text-gray-600">Sign in with ZAPT to get started</p>
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
                  inputText: '#333333',
                  inputBackground: '#ffffff',
                  inputBorder: '#4ECDC4',
                  inputLabelText: '#555555',
                  messageText: '#4a5568',
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
        
        <div className="text-center text-gray-600">
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