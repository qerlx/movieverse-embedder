
import React from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

// Since we've removed the theme switcher functionality, this component 
// is now just a placeholder that could be used for future theming options
const ThemeSwitcher: React.FC = () => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-9 px-2.5 text-muted-foreground hover:text-white group"
      aria-label="Theme settings"
    >
      <Palette size={18} className="mr-1.5 group-hover:text-primary transition-colors" />
      <span className="hidden sm:inline">Theme</span>
    </Button>
  );
};

export default ThemeSwitcher;
