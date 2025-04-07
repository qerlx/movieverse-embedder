
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, UserCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const MobileNavigation = () => {
  const { theme } = useTheme();
  const isNetflix = theme === 'netflix';
  
  const getLinkStyle = ({ isActive }: { isActive: boolean }) => {
    if (isNetflix) {
      return cn(
        'bottom-nav-item relative',
        isActive ? 'text-white' : 'text-gray-500'
      );
    }
    
    return cn(
      'bottom-nav-item relative',
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
      className={cn(
        "bottom-nav",
        isNetflix && "bg-black/95 border-t border-gray-900/50"
      )}
    >
      {items.map((item, index) => {
        const IconComponent = item.icon;
        
        // Special case for Netflix logo in the middle
        if (isNetflix && index === 2) {
          return (
            <div key="netflix-logo" className="relative z-10">
              <motion.div 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -top-6 p-2 bg-black rounded-full border border-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E50914" className="w-6 h-6">
                  <path d="M7.52 21.48C7.52 21.48 7.52 21.48 7.52 21.48L7.52 2.52C7.52 2.52 7.52 2.52 7.52 2.52V1.98H16.52V2.52V21.48V22.02H7.52V21.48Z" />
                </svg>
              </motion.div>
            </div>
          );
        }
        
        // For Netflix theme, reorder to have 2 items on each side
        if (isNetflix) {
          // Adjust the indices for 2-1-2 layout
          if (index > 2) {
            const adjustedItem = items[index-1];
            return (
              <NavLink 
                key={adjustedItem.to} 
                to={adjustedItem.to} 
                className={getLinkStyle}
              >
                {({ isActive }) => {
                  const NavIcon = adjustedItem.icon;
                  return (
                    <>
                      <NavIcon 
                        className={cn(
                          "bottom-nav-icon", 
                          isActive 
                            ? isNetflix ? "text-white" : "text-primary" 
                            : "text-muted-foreground"
                        )} 
                        size={20} 
                      />
                      <span className="bottom-nav-text">{adjustedItem.label}</span>
                      
                      {isActive && (
                        <motion.div 
                          className={cn(
                            "absolute -top-1 left-1/2 transform -translate-x-1/2 h-0.5 w-5",
                            isNetflix ? "bg-red-600" : "bg-primary"
                          )}
                          layoutId="activeIndicator"
                        />
                      )}
                    </>
                  );
                }}
              </NavLink>
            );
          } else if (index === 2) {
            return null; // Skip middle position as it's replaced by Netflix logo
          }
        }
        
        return (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={getLinkStyle}
          >
            {({ isActive }) => (
              <>
                <IconComponent 
                  className={cn(
                    "bottom-nav-icon", 
                    isActive 
                      ? isNetflix ? "text-white" : "text-primary" 
                      : "text-muted-foreground"
                  )} 
                  size={20} 
                />
                <span className="bottom-nav-text">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    className={cn(
                      "absolute -top-1 left-1/2 transform -translate-x-1/2 h-0.5 w-5",
                      isNetflix ? "bg-red-600" : "bg-primary"
                    )}
                    layoutId="activeIndicator"
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
