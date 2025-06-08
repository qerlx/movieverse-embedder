
import React, { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const themes = [
  { name: "Default", value: "default", colors: ["#8B5CF6", "#A855F7", "#9333EA"] },
  { name: "Blue Ocean", value: "blue", colors: ["#3B82F6", "#2563EB", "#1D4ED8"] },
  { name: "Emerald", value: "emerald", colors: ["#10B981", "#059669", "#047857"] },
  { name: "Rose", value: "rose", colors: ["#F43F5E", "#E11D48", "#BE123C"] },
  { name: "Amber", value: "amber", colors: ["#F59E0B", "#D97706", "#B45309"] },
];

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState("default");

  const applyTheme = (themeValue: string) => {
    const theme = themes.find(t => t.value === themeValue);
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply theme colors to CSS custom properties
    switch (themeValue) {
      case "blue":
        root.style.setProperty('--primary', '214 100% 55%'); // Blue
        break;
      case "emerald":
        root.style.setProperty('--primary', '160 84% 39%'); // Emerald
        break;
      case "rose":
        root.style.setProperty('--primary', '348 83% 47%'); // Rose
        break;
      case "amber":
        root.style.setProperty('--primary', '43 96% 56%'); // Amber
        break;
      default:
        root.style.setProperty('--primary', '262 83% 58%'); // Default purple
        break;
    }
    
    setCurrentTheme(themeValue);
    
    // Store theme preference
    localStorage.setItem('app-theme', themeValue);
  };

  // Load saved theme on component mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'default';
    applyTheme(savedTheme);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-3 text-muted-foreground hover:text-white group relative overflow-hidden"
          aria-label="Theme settings"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Palette size={18} className="mr-2 group-hover:text-primary transition-colors" />
          </motion.div>
          <span className="hidden sm:inline font-medium">Theme</span>
          
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-black/95 backdrop-blur-xl border-primary/20 shadow-xl"
      >
        <div className="p-2">
          <div className="text-sm font-medium text-white/90 mb-3 px-2">Choose Theme</div>
          
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => applyTheme(theme.value)}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group"
            >
              {/* Color preview */}
              <div className="flex items-center gap-1">
                {theme.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <span className="flex-1 text-white/90 group-hover:text-white font-medium">
                {theme.name}
              </span>
              
              {currentTheme === theme.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-primary"
                >
                  <Check size={16} />
                </motion.div>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
