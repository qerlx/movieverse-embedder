
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, iconOnly = false }) => {
  const { theme } = useTheme();
  const isNetflix = theme === 'netflix';
  
  if (iconOnly) {
    return (
      <Link 
        to="/" 
        className={cn("flex items-center justify-center", className)}
      >
        {isNetflix ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M5 2H19V22L12 18L5 22V2Z" fill="#E50914" />
          </svg>
        ) : (
          <img 
            src="/lovable-uploads/caa73530-a5df-42b6-967d-52fda023811b.png" 
            alt="MovieStreamHub" 
            className="w-8 h-8 object-contain" 
          />
        )}
      </Link>
    );
  }
  
  // Netflix-style logo
  if (isNetflix) {
    return (
      <Link 
        to="/" 
        className={cn("text-2xl font-black tracking-tighter", className)}
      >
        <motion.span 
          className="text-[#E50914]"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          MOVIESTREAM
        </motion.span>
      </Link>
    );
  }
  
  // Default logo
  return (
    <Link 
      to="/" 
      className={cn("text-2xl font-bold text-primary transition-all duration-300 hover:opacity-80", className)}
    >
      <span className="text-white">Movie</span>
      <span className="text-primary">Stream</span>
      <span className="text-white">Hub</span>
    </Link>
  );
};

export default Logo;
