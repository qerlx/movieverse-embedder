
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, iconOnly = false }) => {
  if (iconOnly) {
    return (
      <Link 
        to="/" 
        className={cn("flex items-center justify-center", className)}
      >
        <motion.img 
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
          src="/lovable-uploads/caa73530-a5df-42b6-967d-52fda023811b.png" 
          alt="MovieStreamHub" 
          className="w-8 h-8 object-contain purple-glow" 
        />
      </Link>
    );
  }
  
  return (
    <Link 
      to="/" 
      className={cn("text-2xl font-bold transition-all duration-300 hover:opacity-80", className)}
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2"
      >
        <motion.img 
          whileHover={{ rotate: 10 }}
          transition={{ duration: 0.3 }}
          src="/lovable-uploads/caa73530-a5df-42b6-967d-52fda023811b.png" 
          alt="MovieStreamHub" 
          className="w-8 h-8 purple-glow" 
        />
        <span className="flex font-bold">
          <span className="text-white">Movie</span>
          <span className="text-primary">Stream</span>
          <span className="text-white">Hub</span>
        </span>
      </motion.div>
    </Link>
  );
};

export default Logo;
