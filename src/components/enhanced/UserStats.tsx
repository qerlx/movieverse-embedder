import React from "react";
import { motion } from "framer-motion";
import { Heart, Clock, Film, Tv, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserStatsProps {
  favorites: any[];
  recentlyWatched: any[];
}

export const UserStats: React.FC<UserStatsProps> = ({ favorites, recentlyWatched }) => {
  const movieCount = favorites.filter(f => f.mediaType === "movie").length;
  const tvCount = favorites.filter(f => f.mediaType === "tv").length;
  
  const watchedThisWeek = recentlyWatched.filter(w => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return w.lastWatched > weekAgo;
  }).length;

  const watchedThisMonth = recentlyWatched.filter(w => {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return w.lastWatched > monthAgo;
  }).length;

  const stats = [
    {
      icon: Heart,
      label: "Total Favorites",
      value: favorites.length,
      subtitle: `${movieCount} movies, ${tvCount} shows`,
      color: "text-red-500",
      bgColor: "from-red-500/10 to-red-500/5",
      borderColor: "border-red-500/20 hover:border-red-500/40"
    },
    {
      icon: Clock,
      label: "All Time Watched",
      value: recentlyWatched.length,
      subtitle: `${watchedThisWeek} this week`,
      color: "text-blue-500",
      bgColor: "from-blue-500/10 to-blue-500/5",
      borderColor: "border-blue-500/20 hover:border-blue-500/40"
    },
    {
      icon: TrendingUp,
      label: "Weekly Activity",
      value: watchedThisWeek,
      subtitle: "items watched",
      color: "text-green-500",
      bgColor: "from-green-500/10 to-green-500/5",
      borderColor: "border-green-500/20 hover:border-green-500/40"
    },
    {
      icon: Calendar,
      label: "Monthly Total",
      value: watchedThisMonth,
      subtitle: "last 30 days",
      color: "text-purple-500",
      bgColor: "from-purple-500/10 to-purple-500/5",
      borderColor: "border-purple-500/20 hover:border-purple-500/40"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} transition-all duration-300 hover:scale-105`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default UserStats;
