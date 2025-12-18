import { useState, useEffect, useCallback } from 'react';

export interface SourceStatus {
  id: string;
  status: 'best' | 'works' | 'buffers' | 'broken' | 'unknown';
  lastChecked: number;
  loadTime?: number;
  failCount: number;
}

const STORAGE_KEY = 'video-source-status';
const LAST_WORKING_KEY = 'last-working-source';

export function useSourceStatus() {
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, SourceStatus>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [lastWorkingSource, setLastWorkingSource] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_WORKING_KEY);
    } catch {
      return null;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sourceStatuses));
    } catch (e) {
      console.error('Failed to persist source statuses:', e);
    }
  }, [sourceStatuses]);

  const updateSourceStatus = useCallback((
    sourceId: string, 
    status: SourceStatus['status'], 
    loadTime?: number
  ) => {
    setSourceStatuses(prev => {
      const existing = prev[sourceId] || { id: sourceId, failCount: 0 };
      const newFailCount = status === 'broken' ? existing.failCount + 1 : 0;
      
      return {
        ...prev,
        [sourceId]: {
          ...existing,
          id: sourceId,
          status,
          lastChecked: Date.now(),
          loadTime,
          failCount: newFailCount
        }
      };
    });

    // Update last working source
    if (status === 'works' || status === 'best') {
      setLastWorkingSource(sourceId);
      try {
        localStorage.setItem(LAST_WORKING_KEY, sourceId);
      } catch (e) {
        console.error('Failed to save last working source:', e);
      }
    }
  }, []);

  const reportLoadSuccess = useCallback((sourceId: string, loadTime: number) => {
    const status: SourceStatus['status'] = loadTime < 3000 ? 'best' : loadTime < 8000 ? 'works' : 'buffers';
    updateSourceStatus(sourceId, status, loadTime);
  }, [updateSourceStatus]);

  const reportLoadFailure = useCallback((sourceId: string) => {
    updateSourceStatus(sourceId, 'broken');
  }, [updateSourceStatus]);

  const getSourceStatus = useCallback((sourceId: string): SourceStatus['status'] => {
    const status = sourceStatuses[sourceId];
    if (!status) return 'unknown';
    
    // Consider status stale after 24 hours
    const isStale = Date.now() - status.lastChecked > 24 * 60 * 60 * 1000;
    if (isStale) return 'unknown';
    
    return status.status;
  }, [sourceStatuses]);

  const getBestSource = useCallback((sourceIds: string[]): string | null => {
    // First try last working source
    if (lastWorkingSource && sourceIds.includes(lastWorkingSource)) {
      const status = getSourceStatus(lastWorkingSource);
      if (status !== 'broken') return lastWorkingSource;
    }

    // Sort by status priority
    const priorityOrder: Record<SourceStatus['status'], number> = {
      best: 0,
      works: 1,
      unknown: 2,
      buffers: 3,
      broken: 4
    };

    const sorted = [...sourceIds].sort((a, b) => {
      const statusA = getSourceStatus(a);
      const statusB = getSourceStatus(b);
      return priorityOrder[statusA] - priorityOrder[statusB];
    });

    return sorted[0] || null;
  }, [lastWorkingSource, getSourceStatus]);

  const getNextFallback = useCallback((currentSourceId: string, sourceIds: string[]): string | null => {
    const currentIndex = sourceIds.indexOf(currentSourceId);
    const remaining = sourceIds.filter((id, idx) => {
      if (idx <= currentIndex) return false;
      const status = getSourceStatus(id);
      return status !== 'broken';
    });

    return remaining[0] || null;
  }, [getSourceStatus]);

  return {
    sourceStatuses,
    lastWorkingSource,
    updateSourceStatus,
    reportLoadSuccess,
    reportLoadFailure,
    getSourceStatus,
    getBestSource,
    getNextFallback
  };
}
