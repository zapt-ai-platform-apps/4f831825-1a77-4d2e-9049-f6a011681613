import React, { useState } from 'react';
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <MonthNavigationProvider>
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        {user && <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
        <main className="flex-grow pt-14">
          {children}
        </main>
        <Footer />
      </MonthNavigationProvider>
    </div>
  );
}

export default AppLayout;