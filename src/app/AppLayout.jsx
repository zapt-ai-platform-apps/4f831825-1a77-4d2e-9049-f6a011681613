import React, { useState, useEffect } from 'react';
import Header from '../shared/components/Header';
import MobileMenu from '../shared/components/MobileMenu';
import Footer from '../shared/components/Footer';
import { MonthNavigationProvider } from '../modules/timetable/ui/MonthNavigationContext';
import { useAuth } from '../modules/auth/ui/useAuth';

/**
 * Layout wrapper for the application
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} App layout component
 */
function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  // Prevent duplicate footers by removing any that might be rendered elsewhere
  useEffect(() => {
    // Check if there are multiple footer elements
    const footers = document.querySelectorAll('footer');
    
    // If more than one footer exists, remove all but the last one (which will be this component's footer)
    if (footers.length > 1) {
      // Remove all footers except the last one (which will be added by this component)
      for (let i = 0; i < footers.length - 1; i++) {
        footers[i].remove();
      }
      console.log('Removed duplicate footer elements');
    }
  }, [user]); // Re-run when user state changes (login/logout)

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <MonthNavigationProvider>
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        {user && <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
        <main className="flex-grow pt-14">
          {children}
        </main>
        {/* This is the single source of truth for the footer */}
        <Footer />
      </MonthNavigationProvider>
    </div>
  );
}

export default AppLayout;