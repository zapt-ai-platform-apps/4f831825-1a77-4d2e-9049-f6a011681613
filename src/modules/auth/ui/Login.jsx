import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../core/api';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from './useAuth';
import { useTheme } from '../../core/ui/ThemeContext';

/**
 * Login component using Supabase Auth UI
 */
function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isDarkMode } = useTheme();

  // Redirect to preferences if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/preferences', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary/30 dark:border-primary/20">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-primary dark:text-primary">Welcome to UpGrade! 🎉</h2>
          <p className="text-gray-600 dark:text-gray-300">Sign in with ZAPT to get started</p>
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
                  inputText: isDarkMode ? '#f3f4f6' : '#333333',
                  inputBackground: isDarkMode ? '#374151' : '#ffffff',
                  inputBorder: isDarkMode ? '#4b5563' : '#4ECDC4',
                  inputLabelText: isDarkMode ? '#d1d5db' : '#555555',
                  messageText: isDarkMode ? '#e5e7eb' : '#4a5568',
                  modalBackground: isDarkMode ? '#1f2937' : '#ffffff',
                  foreground: isDarkMode ? '#f9fafb' : '#333333',
                  baseBackground: isDarkMode ? '#111827' : '#ffffff',
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
        
        <div className="text-center text-gray-600 dark:text-gray-400">
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