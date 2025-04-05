
import React, { useState } from "react";
import { Palette, Check, Monitor, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const ThemeCard = ({ 
    id, 
    name, 
    color, 
    logo, 
    active 
  }: { 
    id: "default" | "netflix"; 
    name: string; 
    color: string;
    logo: React.ReactNode;
    active: boolean;
  }) => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
          active 
            ? `ring-2 ring-offset-2 ring-offset-background ring-${color} bg-${color}/10` 
            : 'bg-card hover:bg-card/80'
        }`}
        onClick={() => setTheme(id)}
      >
        {active && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className={`absolute -top-2 -right-2 bg-${color} text-white p-1 rounded-full`}
          >
            <Check size={14} />
          </motion.div>
        )}
        <div className="h-24 rounded-lg overflow-hidden flex items-center justify-center bg-black mb-3">
          {logo}
        </div>
        <h3 className="text-base font-medium">{name}</h3>
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-2.5 text-muted-foreground hover:text-white group"
        >
          <Palette size={18} className="mr-1.5 group-hover:text-primary transition-colors" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose a Theme</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-3">
          <ThemeCard 
            id="default" 
            name="MovieStreamHub" 
            color="primary" 
            active={theme === "default"}
            logo={
              <div className="flex items-center justify-center text-xl font-bold">
                <span className="text-white">Movie</span>
                <span className="text-primary">Stream</span>
                <span className="text-white">Hub</span>
              </div>
            } 
          />
          <ThemeCard 
            id="netflix" 
            name="Netflix Style" 
            color="red-600" 
            active={theme === "netflix"} 
            logo={
              <div className="bg-black p-2 w-full h-full flex items-center justify-center">
                <svg width="120" height="32" viewBox="0 0 111 30" fill="#e50914" xmlns="http://www.w3.org/2000/svg">
                  <path d="M105.06 14.28L111 0H105.06V14.28ZM105.06 29.7066V14.28L111 29.7066H105.06ZM100.123 0H94.186V29.7066H100.123V0ZM89.2497 0H83.3135V29.7066H89.2497V0ZM78.3765 0H72.4404V29.7066H78.3765V0ZM67.5033 0H61.5672V29.7066H67.5033V0ZM56.63 14.28L62.5696 0H56.6335V14.28H56.63ZM56.63 29.7066V14.28L62.5696 29.7066H56.63ZM51.6929 0H45.7568V29.7066H51.6929V0ZM40.8197 0H34.8836V29.7066H40.8197V0ZM29.9464 0H24.0103V29.7066H29.9464V0ZM19.073 0H13.1369V29.7066H19.073V0ZM8.20245 0H2.26634V29.7066H8.20245V0ZM0 0V29.7066H2.26634V0H0Z" />
                </svg>
              </div>
            } 
          />
        </div>
        <div className="flex justify-end pt-3">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSwitcher;
