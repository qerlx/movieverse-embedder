
import React from "react";
import { Palette } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-2 text-muted-foreground hover:text-white"
        >
          <Palette size={20} className="mr-1.5" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          className={theme === 'default' ? 'bg-primary/20' : ''}
          onClick={() => setTheme('default')}
        >
          Default Theme
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={theme === 'netflix' ? 'bg-red-700/20' : ''}
          onClick={() => setTheme('netflix')}
        >
          Netflix Style
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={theme === 'prime' ? 'bg-blue-700/20' : ''}
          onClick={() => setTheme('prime')}
        >
          Prime Video Style
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
