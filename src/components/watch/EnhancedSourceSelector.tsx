import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, CheckCircle2, AlertCircle, Clock, HelpCircle, 
  Zap, ChevronDown, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { videoSources, VideoSource } from '@/utils/video';
import { useSourceStatus, SourceStatus } from '@/hooks/useSourceStatus';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EnhancedSourceSelectorProps {
  currentSourceId: string;
  onSwitch: (sourceId: string) => void;
  isAnime?: boolean;
  onTryBest?: () => void;
  compact?: boolean;
}

const statusConfig: Record<SourceStatus['status'], {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}> = {
  best: {
    icon: Zap,
    label: 'Best',
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  works: {
    icon: CheckCircle2,
    label: 'Works',
    color: 'text-info',
    bgColor: 'bg-info/10'
  },
  buffers: {
    icon: Clock,
    label: 'Slow',
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  broken: {
    icon: AlertCircle,
    label: 'Broken',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  unknown: {
    icon: HelpCircle,
    label: 'Unknown',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/10'
  }
};

export const EnhancedSourceSelector: React.FC<EnhancedSourceSelectorProps> = ({
  currentSourceId,
  onSwitch,
  isAnime = false,
  onTryBest,
  compact = false
}) => {
  const { getSourceStatus, lastWorkingSource, getBestSource } = useSourceStatus();

  const availableSources = useMemo(() => {
    return isAnime
      ? videoSources.filter(s => s.supportsAnime)
      : videoSources.filter(s => s.id !== 'vidsrc-anime');
  }, [isAnime]);

  const currentSource = availableSources.find(s => s.id === currentSourceId) || availableSources[0];
  const currentStatus = getSourceStatus(currentSourceId);
  const StatusIcon = statusConfig[currentStatus].icon;

  const handleTryBest = () => {
    const bestSourceId = getBestSource(availableSources.map(s => s.id));
    if (bestSourceId && bestSourceId !== currentSourceId) {
      onSwitch(bestSourceId);
    }
    onTryBest?.();
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-black/80"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">{currentSource.name}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Video Sources</span>
            {lastWorkingSource && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {availableSources.map((source) => {
            const status = getSourceStatus(source.id);
            const config = statusConfig[status];
            const Icon = config.icon;
            const isActive = source.id === currentSourceId;
            const isRecommended = source.id === lastWorkingSource;

            return (
              <DropdownMenuItem
                key={source.id}
                onClick={() => onSwitch(source.id)}
                className={cn(
                  "flex items-center justify-between cursor-pointer",
                  isActive && "bg-primary/10"
                )}
              >
                <div className="flex items-center gap-2">
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                  <span className={cn(!isActive && "ml-4")}>
                    {source.name}
                  </span>
                  {isRecommended && !isActive && (
                    <Star className="w-3 h-3 text-warning fill-warning" />
                  )}
                </div>
                <div className={cn("flex items-center gap-1", config.color)}>
                  <Icon className="w-3 h-3" />
                  <span className="text-xs">{config.label}</span>
                </div>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleTryBest} className="cursor-pointer">
            <Zap className="w-4 h-4 mr-2 text-success" />
            Try Best Source
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <motion.div
      className="backdrop-blur-xl bg-card/95 rounded-2xl border border-primary/20 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Video Source</span>
        </div>
        <button
          onClick={handleTryBest}
          className="flex items-center gap-1 text-xs text-success hover:text-success/80 transition-colors"
        >
          <Zap className="w-3 h-3" />
          Try Best
        </button>
      </div>

      {/* Source Grid */}
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {availableSources.map((source) => {
          const status = getSourceStatus(source.id);
          const config = statusConfig[status];
          const Icon = config.icon;
          const isActive = source.id === currentSourceId;
          const isRecommended = source.id === lastWorkingSource;

          return (
            <motion.button
              key={source.id}
              onClick={() => onSwitch(source.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative px-3 py-2 text-sm rounded-xl border transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                  : "bg-background/50 text-foreground border-border/50 hover:border-primary/50 hover:bg-background"
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium truncate">{source.name}</span>
                {isRecommended && !isActive && (
                  <Star className="w-3 h-3 text-warning fill-warning flex-shrink-0" />
                )}
              </div>
              
              {/* Status indicator */}
              <div className={cn(
                "flex items-center gap-1 mt-1 text-xs",
                isActive ? "text-primary-foreground/70" : config.color
              )}>
                <Icon className="w-3 h-3" />
                <span>{config.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EnhancedSourceSelector;
