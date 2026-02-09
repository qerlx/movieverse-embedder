import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Shield, ExternalLink, ShieldCheck, Zap, Ban } from 'lucide-react';
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
      }, 8000); // Show after 8 seconds
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
        damping: 25,
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
              : "bottom-6 right-6 translate-x-0"
          )}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={popupVariants}
        >
          <motion.div 
            className="rounded-2xl shadow-2xl p-5 border bg-gradient-to-br from-card to-card/80 backdrop-blur-xl border-border/50"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <button 
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-2">
              🛡️ Block Ads & Pop-ups
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              For the smoothest streaming experience, we recommend using an ad-blocking DNS. It blocks ads at the network level!
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Ban className="w-3.5 h-3.5 text-success" />
                <span>No pop-ups</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-success" />
                <span>Faster loading</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span>Privacy protection</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span>Device-wide</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                className="w-full gap-2 shadow-lg"
                onClick={() => {
                  window.open('https://adguard-dns.io/en/public-dns.html', '_blank');
                }}
                size="sm"
              >
                <ExternalLink size={14} /> Setup AdGuard DNS
              </Button>
              
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={handleDismiss}
                size="sm"
              >
                I'll do this later
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DnsPopup;
