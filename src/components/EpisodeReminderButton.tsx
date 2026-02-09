import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  hasReminder,
  toggleReminder,
  requestNotificationPermission,
  formatNextEpisodeDate,
  getReminders
} from '@/lib/episode-reminders';
import { toast } from '@/hooks/use-toast';

interface EpisodeReminderButtonProps {
  showId: number;
  showName: string;
  posterPath: string | null;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export const EpisodeReminderButton: React.FC<EpisodeReminderButtonProps> = ({
  showId,
  showName,
  posterPath,
  variant = 'outline',
  size = 'default',
  className,
  showLabel = true
}) => {
  const [isReminded, setIsReminded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextEpisode, setNextEpisode] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const reminded = hasReminder(showId);
    setIsReminded(reminded);
    
    if (reminded) {
      const reminders = getReminders();
      const reminder = reminders.find(r => r.showId === showId);
      if (reminder?.nextEpisodeDate) {
        setNextEpisode(formatNextEpisodeDate(reminder.nextEpisodeDate));
      }
    }
  }, [showId]);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      // Request notification permission first
      if (!isReminded) {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
          toast({
            title: "Notifications Blocked",
            description: "Please enable notifications in your browser settings to receive episode reminders.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      const result = await toggleReminder(showId, showName, posterPath);
      setIsReminded(result.hasReminder);

      if (result.hasReminder && result.reminder) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        
        if (result.reminder.nextEpisodeDate) {
          setNextEpisode(formatNextEpisodeDate(result.reminder.nextEpisodeDate));
        }

        toast({
          title: "Reminder Set!",
          description: `You'll be notified when new episodes of ${showName} are available.`,
        });
      } else {
        setNextEpisode(null);
        toast({
          title: "Reminder Removed",
          description: `You won't receive notifications for ${showName}.`,
        });
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isReminded ? BellRing : Bell;

  return (
    <Button
      variant={isReminded ? 'default' : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "gap-2 transition-all duration-300",
        isReminded && "bg-primary/20 border-primary/40 text-primary hover:bg-primary/30",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Check className="w-4 h-4 text-success" />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon 
              className={cn(
                "w-4 h-4",
                isReminded && "animate-pulse"
              )} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {showLabel && (
        <span className="hidden sm:inline">
          {isLoading ? 'Setting...' : isReminded ? 'Reminded' : 'Remind Me'}
        </span>
      )}
      
      {isReminded && nextEpisode && showLabel && (
        <span className="text-xs opacity-70 hidden md:inline">
          • {nextEpisode}
        </span>
      )}
    </Button>
  );
};

export default EpisodeReminderButton;
