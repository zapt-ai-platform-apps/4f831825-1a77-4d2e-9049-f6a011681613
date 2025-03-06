import React, { useState } from 'react';
import Header from '../shared/components/Header';
import MobileMenu from '../shared/components/MobileMenu';
import Footer from '../shared/components/Footer';

/**
 * Layout component for the authenticated application
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} App layout
 */
function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      {menuOpen && <MobileMenu setMenuOpen={setMenuOpen} />}
      
      <main className="flex-grow flex items-center justify-center h-full pt-4 mt-16">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

export default AppLayout;