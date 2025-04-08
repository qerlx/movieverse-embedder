
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Shield, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const DnsPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useIsMobile();

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
          className={cn(
            "fixed z-50 w-11/12 max-w-sm",
            isMobile 
              ? "bottom-20 left-1/2 -translate-x-1/2" 
              : "bottom-10 right-10 translate-x-0"
          )}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={popupVariants}
        >
          <motion.div 
            className="rounded-lg shadow-lg p-4 sm:p-5 border bg-card border-border"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20">
                <Shield className="text-primary" size={20} />
              </div>
              <button 
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold mt-2 text-foreground">
              Enable Ad Blocking
            </h3>
            
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              For the best streaming experience, we recommend using an ad-blocking DNS like AdGuard or NextDNS.
            </p>
            
            <div className="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="default"
                className="w-full sm:w-auto text-xs sm:text-sm"
                onClick={() => {
                  window.open('https://adguard-dns.io/en/public-dns.html', '_blank');
                }}
                size="sm"
              >
                <ExternalLink size={12} className="mr-1.5" /> AdGuard DNS
              </Button>
              
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs sm:text-sm"
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
