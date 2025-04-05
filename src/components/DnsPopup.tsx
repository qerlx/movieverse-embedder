
import React, { useState, useEffect } from "react";
import { X, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const DnsPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  
  // Check if the user has previously closed the popup with a delay for animation
  useEffect(() => {
    const popupClosed = localStorage.getItem("dnsPopupClosed");
    
    const timer = setTimeout(() => {
      if (!popupClosed) {
        setIsVisible(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    // Save to localStorage so it doesn't show again after refresh
    localStorage.setItem("dnsPopupClosed", "true");
    
    // Show a toast confirmation
    toast({
      title: "Notification hidden",
      description: "You can change DNS settings anytime for ad-free experience",
    });
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, x: -50, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30
          }}
          className={cn(
            "fixed bottom-24 left-4 z-50 w-72 p-4 rounded-lg shadow-lg border animate-in",
            theme === "netflix" 
              ? "bg-[#181818] border-[#333333]" 
              : "bg-card border-border"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "mr-2 p-1.5 rounded-full",
                  theme === "netflix" ? "bg-red-600/20" : "bg-primary/20"
                )}
              >
                <Shield size={16} className={theme === "netflix" ? "text-red-500" : "text-primary"} />
              </motion.div>
              <h4 className="font-medium text-base">Block Ads</h4>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleClose}
            >
              <X size={14} />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground mb-3"
          >
            Change your DNS to <span className="font-mono bg-muted px-1 rounded text-xs">dns.adguard.com</span> in your WiFi settings to stop ads.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <Button 
              variant="link"
              className="text-xs p-0 h-auto flex items-center gap-1"
              asChild
            >
              <a 
                href="https://adguard-dns.io/en/public-dns.html" 
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more <ExternalLink size={10} />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DnsPopup;
