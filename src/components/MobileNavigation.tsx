
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, UserCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNavigation = () => {
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
      className="fixed bottom-0 left-0 right-0 z-50 w-full frosted-navbar border-t border-white/10 h-16"
    >
      <div className="h-full grid grid-cols-5 gap-1">
        {items.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <IconComponent 
                      className={cn(
                        "transition-all", 
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} 
                      size={20} 
                    />
                    
                    {isActive && (
                      <motion.div 
                        layoutId="activeNavDot"
                        className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full"
                        style={{ transform: "translateX(-50%)" }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-xs mt-1 transition-colors",
                    isActive ? "font-medium text-primary" : "font-normal"
                  )}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-10 bg-gradient-to-r from-primary/80 to-primary rounded-b-md"
                      transition={{ type: "spring", stiffness: 500 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MobileNavigation;
