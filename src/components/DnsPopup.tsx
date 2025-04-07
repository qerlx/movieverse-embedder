
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Shield, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const DnsPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { theme } = useTheme();
  const isNetflix = theme === 'netflix';

  // Check local storage for previous dismissal
  useEffect(() => {
    const hasDismissed = localStorage.getItem('dnspopup-dismissed');
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle dismissal
  const handleDismiss = () => {
    setIsOpen(false);
    setDismissed(true);
    localStorage.setItem('dnspopup-dismissed', 'true');
  };

  // Animation variants
  const popupVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.9,
      transition: { 
        duration: 0.3
      }
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed bottom-20 md:bottom-10 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={popupVariants}
        >
          <motion.div 
            className={cn(
              "rounded-lg shadow-lg p-5 border",
              isNetflix 
                ? "bg-black/95 border-gray-800 text-white" 
                : "bg-card border-border"
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isNetflix ? "bg-red-600" : "bg-primary/20"
              )}>
                <Shield className={isNetflix ? "text-white" : "text-primary"} size={24} />
              </div>
              <button 
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            
            <h3 className={cn(
              "text-lg font-semibold mt-3",
              isNetflix ? "text-white" : "text-foreground"
            )}>
              Enable Ad Blocking
            </h3>
            
            <p className={cn(
              "mt-2 text-sm",
              isNetflix ? "text-gray-300" : "text-muted-foreground"
            )}>
              For the best streaming experience, we recommend using an ad-blocking DNS like AdGuard or NextDNS to prevent interruptions.
            </p>
            
            <div className="mt-4 flex space-x-3">
              <Button
                variant={isNetflix ? "destructive" : "default"}
                className={isNetflix && "bg-red-600 hover:bg-red-700"}
                onClick={() => {
                  window.open('https://adguard-dns.io/en/public-dns.html', '_blank');
                }}
                size="sm"
              >
                <ExternalLink size={14} className="mr-2" /> AdGuard DNS
              </Button>
              
              <Button
                variant="outline"
                className={cn(
                  "border-gray-700",
                  isNetflix && "text-white hover:bg-gray-800"
                )}
                onClick={handleDismiss}
                size="sm"
              >
                Maybe Later
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DnsPopup;
