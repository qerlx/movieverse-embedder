import { getTVShowDetails } from './api';

export interface EpisodeReminder {
  showId: number;
  showName: string;
  posterPath: string | null;
  lastCheckedEpisode: {
    season: number;
    episode: number;
  };
  nextEpisodeDate: string | null;
  createdAt: string;
  notified: boolean;
}

const REMINDERS_KEY = 'episode-reminders';
const NOTIFICATION_CHECK_KEY = 'last-notification-check';

// Get all reminders
export function getReminders(): EpisodeReminder[] {
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save reminders
function saveReminders(reminders: EpisodeReminder[]) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

// Add a reminder for a show
export async function addReminder(
  showId: number,
  showName: string,
  posterPath: string | null
): Promise<EpisodeReminder> {
  const reminders = getReminders();
  
  // Check if already exists
  const existing = reminders.find(r => r.showId === showId);
  if (existing) {
    return existing;
  }

  // Fetch show details to get latest episode info
  let lastEpisode = { season: 1, episode: 1 };
  let nextEpisodeDate: string | null = null;
  
  try {
    const showDetails = await getTVShowDetails(showId);
    if (showDetails) {
      // Get the latest season and episode
      const latestSeason = showDetails.number_of_seasons || 1;
      const latestEpisode = showDetails.number_of_episodes || 1;
      lastEpisode = { season: latestSeason, episode: latestEpisode };
      
      // Check for next episode air date
      if (showDetails.next_episode_to_air) {
        nextEpisodeDate = showDetails.next_episode_to_air.air_date;
      }
    }
  } catch (error) {
    console.error('Error fetching show details for reminder:', error);
  }

  const reminder: EpisodeReminder = {
    showId,
    showName,
    posterPath,
    lastCheckedEpisode: lastEpisode,
    nextEpisodeDate,
    createdAt: new Date().toISOString(),
    notified: false
  };

  reminders.push(reminder);
  saveReminders(reminders);
  
  return reminder;
}

// Remove a reminder
export function removeReminder(showId: number): boolean {
  const reminders = getReminders();
  const filtered = reminders.filter(r => r.showId !== showId);
  
  if (filtered.length !== reminders.length) {
    saveReminders(filtered);
    return true;
  }
  return false;
}

// Check if a show has a reminder
export function hasReminder(showId: number): boolean {
  const reminders = getReminders();
  return reminders.some(r => r.showId === showId);
}

// Toggle reminder
export async function toggleReminder(
  showId: number,
  showName: string,
  posterPath: string | null
): Promise<{ hasReminder: boolean; reminder?: EpisodeReminder }> {
  if (hasReminder(showId)) {
    removeReminder(showId);
    return { hasReminder: false };
  } else {
    const reminder = await addReminder(showId, showName, posterPath);
    return { hasReminder: true, reminder };
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Send a notification
export function sendNotification(title: string, body: string, icon?: string) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'episode-reminder',
      requireInteraction: false,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }
}

// Check for new episodes (should be called periodically)
export async function checkForNewEpisodes(): Promise<EpisodeReminder[]> {
  const reminders = getReminders();
  const newEpisodes: EpisodeReminder[] = [];
  const now = new Date();

  // Only check once per hour
  const lastCheck = localStorage.getItem(NOTIFICATION_CHECK_KEY);
  if (lastCheck) {
    const lastCheckTime = new Date(lastCheck);
    const hoursSinceCheck = (now.getTime() - lastCheckTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCheck < 1) {
      return [];
    }
  }

  localStorage.setItem(NOTIFICATION_CHECK_KEY, now.toISOString());

  for (const reminder of reminders) {
    try {
      const showDetails = await getTVShowDetails(reminder.showId);
      
      if (showDetails) {
        const currentSeasons = showDetails.number_of_seasons || 1;
        const currentEpisodes = showDetails.number_of_episodes || 1;
        
        // Check if there are new episodes
        const hasNewContent = 
          currentSeasons > reminder.lastCheckedEpisode.season ||
          (currentSeasons === reminder.lastCheckedEpisode.season && 
           currentEpisodes > reminder.lastCheckedEpisode.episode);

        // Check if next episode date has passed
        const nextEpisodeReleased = reminder.nextEpisodeDate && 
          new Date(reminder.nextEpisodeDate) <= now;

        if ((hasNewContent || nextEpisodeReleased) && !reminder.notified) {
          newEpisodes.push(reminder);
          
          // Update reminder
          reminder.lastCheckedEpisode = {
            season: currentSeasons,
            episode: currentEpisodes
          };
          reminder.nextEpisodeDate = showDetails.next_episode_to_air?.air_date || null;
          reminder.notified = true;
        } else {
          // Reset notified flag if next episode is in future
          if (showDetails.next_episode_to_air && 
              new Date(showDetails.next_episode_to_air.air_date) > now) {
            reminder.notified = false;
            reminder.nextEpisodeDate = showDetails.next_episode_to_air.air_date;
          }
        }
      }
    } catch (error) {
      console.error(`Error checking episodes for ${reminder.showName}:`, error);
    }
  }

  saveReminders(reminders);
  return newEpisodes;
}

// Format next episode date
export function formatNextEpisodeDate(dateString: string | null): string {
  if (!dateString) return 'TBA';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Out now!';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
