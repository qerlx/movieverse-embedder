import React, { useEffect, useRef } from 'react';
import { 
  checkForNewEpisodes, 
  sendNotification, 
  requestNotificationPermission,
  getReminders 
} from '@/lib/episode-reminders';
import { toast } from '@/hooks/use-toast';

export const NotificationManager: React.FC = () => {
  const checkIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initNotifications = async () => {
      // Only proceed if there are reminders
      const reminders = getReminders();
      if (reminders.length === 0) return;

      // Request permission on first load
      await requestNotificationPermission();

      // Check for new episodes immediately
      await checkAndNotify();

      // Set up periodic checking (every 30 minutes)
      checkIntervalRef.current = setInterval(checkAndNotify, 30 * 60 * 1000);
    };

    const checkAndNotify = async () => {
      try {
        const newEpisodes = await checkForNewEpisodes();
        
        for (const episode of newEpisodes) {
          // Send browser notification
          sendNotification(
            `New Episode Available!`,
            `${episode.showName} has a new episode ready to watch.`,
            episode.posterPath 
              ? `https://image.tmdb.org/t/p/w92${episode.posterPath}`
              : undefined
          );

          // Also show in-app toast
          toast({
            title: "🎬 New Episode!",
            description: `${episode.showName} has a new episode available.`,
          });
        }
      } catch (error) {
        console.error('Error checking for new episodes:', error);
      }
    };

    initNotifications();

    // Also check when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndNotify();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // This is a manager component, no UI
};

export default NotificationManager;
