
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
        <img 
          src="/MSH-uploads/caa73530-a5df-42b6-967d-52fda023811b.png" 
          alt="MovieStreamHub" 
          className="w-8 h-8 object-contain" 
        />
      </Link>
    );
  }
  
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
