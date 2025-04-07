
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

const NETFLIX_LOGO_URL = "https://i0.wp.com/png.co.ke/wp-content/uploads/2024/05/CITYPNG.COMNetflix-Vector-Flat-Logo-886x885-1.png?fit=886%2C885&ssl=1";

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
          <img 
            src={NETFLIX_LOGO_URL} 
            alt="Netflix"
            className="h-8 w-8 object-contain" 
          />
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
        className={cn("flex items-center", className)}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img 
            src={NETFLIX_LOGO_URL} 
            alt="Netflix" 
            className="h-8 md:h-10 object-contain" 
          />
        </motion.div>
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
