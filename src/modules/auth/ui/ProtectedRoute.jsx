import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Protected route component that redirects to home page if user is not authenticated
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Protected route
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    // Changed redirection from "/login" to "/" (home page)
    return <Navigate to="/" replace />;
  }
  
  // Just return the children directly, no AppLayout wrapper
  return children;
}

export default ProtectedRoute;