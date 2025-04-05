
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, UserCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const MobileNavigation = () => {
  const { theme } = useTheme();
  
  const getLinkStyle = ({ isActive }: { isActive: boolean }) => {
    if (theme === 'netflix') {
      return cn(
        'bottom-nav-item',
        isActive ? 'text-white' : 'text-gray-400'
      );
    }
    
    if (theme === 'prime') {
      return cn(
        'bottom-nav-item',
        isActive ? 'text-white' : 'text-gray-400'
      );
    }
    
    return cn(
      'bottom-nav-item',
      isActive ? 'text-primary' : 'text-muted-foreground'
    );
  };

  return (
    <div className={cn(
      "bottom-nav",
      theme === "netflix" && "bg-black/90 border-gray-900/50",
      theme === "prime" && "bg-[#1a242f]/95 border-[#273340]/50"
    )}>
      <NavLink to="/" className={getLinkStyle}>
        <Home className="bottom-nav-icon" size={20} />
        <span className="bottom-nav-text">Home</span>
      </NavLink>
      
      <NavLink to="/search" className={getLinkStyle}>
        <Search className="bottom-nav-icon" size={20} />
        <span className="bottom-nav-text">Search</span>
      </NavLink>
      
      {theme === 'netflix' && (
        <div className="flex justify-center -mt-5 relative z-10">
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0U1MDkxNCI+PHBhdGggZD0iTTcuNTI3IDAgTDcuNTIxIDI0IDEyLjA0OSAxOS43MzIgMTYuNTc2IDI0IDE2LjU4IDAgWiIgLz48L3N2Zz4=" 
            alt="N logo" 
            className="w-10 h-10"
          />
        </div>
      )}
      
      <NavLink to="/movies" className={getLinkStyle}>
        <Film className="bottom-nav-icon" size={20} />
        <span className="bottom-nav-text">Movies</span>
      </NavLink>
      
      <NavLink to="/profile" className={getLinkStyle}>
        <UserCircle className="bottom-nav-icon" size={20} />
        <span className="bottom-nav-text">Profile</span>
      </NavLink>
    </div>
  );
};

export default MobileNavigation;
