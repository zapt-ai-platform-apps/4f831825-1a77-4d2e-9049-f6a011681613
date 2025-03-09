import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Logo component
 * @returns {React.ReactElement} Logo component
 */
function Logo() {
  const location = useLocation();
  const smallPaths = ['/timetable', '/exams', '/preferences'];
  const isSmall = location && smallPaths.includes(location.pathname);
  const styleWidth = isSmall ? 'calc(3rem + 0.5cm)' : 'calc(6rem + 1cm)';
  const heightClass = isSmall ? 'h-12' : 'h-24';
  
  return (
    <div className="flex items-center space-x-4">
      <img
        src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/4f831825-1a77-4d2e-9049-f6a011681613/599b08f5-e3d4-498e-a2a5-687a781d184a.png"
        alt="UpGrade Logo"
        style={{ width: styleWidth }}
        className={`${heightClass} transform hover:rotate-12 transition-transform duration-300`}
      />
    </div>
  );
}

export default Logo;