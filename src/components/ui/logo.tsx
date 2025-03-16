
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
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
