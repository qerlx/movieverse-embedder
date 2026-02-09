import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Calendar, Trash2, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  EpisodeReminder,
  getReminders,
  removeReminder,
  formatNextEpisodeDate
} from '@/lib/episode-reminders';

interface RemindersListProps {
  className?: string;
}

export const RemindersList: React.FC<RemindersListProps> = ({ className }) => {
  const [reminders, setReminders] = useState<EpisodeReminder[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setReminders(getReminders());
  }, []);

  const handleRemove = (showId: number) => {
    removeReminder(showId);
    setReminders(getReminders());
  };

  const handleViewShow = (showId: number) => {
    navigate(`/tv/${showId}`);
  };

  if (reminders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex flex-col items-center justify-center py-12 text-center",
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <BellOff className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Reminders Set
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Add reminders to your favorite shows to get notified when new episodes are released.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Episode Reminders
        </h3>
        <span className="text-sm text-muted-foreground">
          {reminders.length} {reminders.length === 1 ? 'show' : 'shows'}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {reminders.map((reminder, index) => (
          <motion.div
            key={reminder.showId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4 p-3">
              {/* Poster */}
              <div 
                className="w-14 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                onClick={() => handleViewShow(reminder.showId)}
              >
                {reminder.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${reminder.posterPath}`}
                    alt={reminder.showName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleViewShow(reminder.showId)}
                >
                  {reminder.showName}
                </h4>
                
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {reminder.nextEpisodeDate 
                      ? `Next: ${formatNextEpisodeDate(reminder.nextEpisodeDate)}`
                      : 'Next episode TBA'
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/70">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last: S{reminder.lastCheckedEpisode.season} E{reminder.lastCheckedEpisode.episode}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleViewShow(reminder.showId)}
                  className="w-8 h-8"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(reminder.showId)}
                  className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Next episode indicator bar */}
            {reminder.nextEpisodeDate && (
              <div className="h-1 bg-primary/20">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RemindersList;
