import React from 'react';
import Logo from './Logo';
import DesktopNav from './DesktopNav';

function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="flex items-center justify-between px-6 py-2 bg-background/80 backdrop-blur-md border-b border-white/10 fixed w-full top-0 z-50">
      <Logo />
      <DesktopNav />
      <button
        className="md:hidden text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </header>
  );
}

export default Header;