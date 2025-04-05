
import React from "react";
import { Palette } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Check } from "lucide-react";

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-2 text-muted-foreground hover:text-white group"
        >
          <Palette size={20} className="mr-1.5 group-hover:text-primary transition-colors" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          className={theme === 'default' ? 'bg-primary/20' : ''}
          onClick={() => setTheme('default')}
        >
          <div className="w-full flex items-center justify-between">
            <span>Default Theme</span>
            {theme === 'default' && <Check size={16} className="text-primary" />}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className={theme === 'netflix' ? 'bg-[#E50914]/20' : ''}
          onClick={() => setTheme('netflix')}
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#E50914] rounded-sm mr-2"></div>
              <span>Netflix Style</span>
            </div>
            {theme === 'netflix' && <Check size={16} className="text-[#E50914]" />}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className={theme === 'prime' ? 'bg-[#00A8E1]/20' : ''}
          onClick={() => setTheme('prime')}
        >
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#00A8E1] rounded-sm mr-2"></div>
              <span>Prime Video Style</span>
            </div>
            {theme === 'prime' && <Check size={16} className="text-[#00A8E1]" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
