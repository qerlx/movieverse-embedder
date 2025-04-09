
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, UserCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MobileNavigation = () => {
  const getLinkStyle = ({ isActive }: { isActive: boolean }) => {
    return cn(
      'flex flex-col items-center justify-center py-2 px-2',
      isActive ? 'text-primary' : 'text-muted-foreground'
    );
  };

  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/movies", icon: Film, label: "Movies" },
    { to: "/tv-shows", icon: Tv, label: "TV" },
    { to: "/profile", icon: UserCircle, label: "Profile" }
  ];

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around z-50 w-full bg-black/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.25)]"
    >
      {items.map((item) => {
        const IconComponent = item.icon;
        
        return (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={getLinkStyle}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <IconComponent 
                    className={cn(
                      "transition-all", 
                      isActive ? "text-primary scale-110" : "text-muted-foreground"
                    )} 
                    size={20} 
                  />
                  
                  {isActive && (
                    <motion.div 
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full"
                      layoutId="navDot"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{ transform: "translateX(-50%)" }}
                    />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-1 transition-all",
                  isActive ? "font-medium" : "font-normal"
                )}>{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full"
                    layoutId="activeIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </motion.div>
  );
};

export default MobileNavigation;
