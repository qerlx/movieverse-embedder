
import React, { useState } from "react";
import { Palette, Check, Monitor, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

const NETFLIX_LOGO_URL = "https://i0.wp.com/png.co.ke/wp-content/uploads/2024/05/CITYPNG.COMNetflix-Vector-Flat-Logo-886x885-1.png?fit=886%2C885&ssl=1";

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
          <DialogDescription>Select your preferred streaming platform theme</DialogDescription>
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
                <img 
                  src={NETFLIX_LOGO_URL} 
                  alt="Netflix Logo"
                  className="h-16 object-contain"
                />
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
