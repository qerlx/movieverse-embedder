
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const DnsPopup = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Check if the user has previously closed the popup
  useEffect(() => {
    const popupClosed = localStorage.getItem("dnsPopupClosed");
    if (popupClosed) {
      setIsVisible(false);
    }
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
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-24 left-4 z-50 w-64 md:w-72 p-4 rounded-lg shadow-lg bg-card border border-border animate-in fade-in duration-300">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm">Tip: Block Ads</h4>
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
      <p className="text-xs text-muted-foreground">
        Change your DNS to <span className="font-mono bg-muted px-1 rounded">dns.adguard.com</span> in your WiFi settings to stop the ads.
      </p>
    </div>
  );
};

export default DnsPopup;
