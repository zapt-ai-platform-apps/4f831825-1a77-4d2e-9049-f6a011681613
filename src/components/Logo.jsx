import React from 'react';

function Logo() {
  return (
    <div className="flex items-center space-x-4">
      <img
        src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/4f831825-1a77-4d2e-9049-f6a011681613/599b08f5-e3d4-498e-a2a5-687a781d184a.png"
        alt="UpGrade Logo"
        className="w-12 h-12 transform hover:rotate-12 transition-transform duration-300"
      />
    </div>
  );
}

export default Logo;