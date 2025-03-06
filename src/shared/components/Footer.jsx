import React from 'react';

/**
 * Footer component
 * @returns {React.ReactElement} Footer component
 */
function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 mt-auto py-6">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <img
            src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/4f831825-1a77-4d2e-9049-f6a011681613/599b08f5-e3d4-498e-a2a5-687a781d184a.png?width=32&height=32"
            alt="ZAPT Logo"
            className="w-8 h-8 opacity-80 hover:opacity-100 transition-opacity"
          />
          <span className="text-gray-400 text-sm">Powered by</span>
          <a
            href="https://www.zapt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
          >
            ZAPT
          </a>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
          <a href="#" className="text-gray-400 hover:text-white text-sm">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;