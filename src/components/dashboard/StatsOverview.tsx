import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Brain
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDynamicStats } from '@/hooks/useDynamicStats';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsOverview() {
  const { data: dashboardStats, isLoading } = useDynamicStats();

  const stats = [
    {
      title: 'Total Complaints',
      value: dashboardStats?.totalComplaints?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-accent',
    },
    {
      title: 'Pending',
      value: dashboardStats?.pendingComplaints?.toLocaleString() || '0',
      change: '-5%',
      changeType: 'positive',
      icon: Clock,
      color: 'bg-warning',
    },
    {
      title: 'Resolved',
      value: dashboardStats?.resolvedComplaints?.toLocaleString() || '0',
      change: '+8%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-success',
    },
    {
      title: 'Avg. Resolution',
      value: `${dashboardStats?.averageResolutionTime || 0} days`,
      change: '-0.5 days',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-info',
    },
    {
      title: 'Credibility Avg.',
      value: `${dashboardStats?.credibilityAverage || 0}%`,
      change: '+2%',
      changeType: 'positive',
      icon: Brain,
      color: 'bg-anonymous',
    },
    {
      title: 'Hotspot Areas',
      value: dashboardStats?.hotspotAreas?.length?.toString() || '0',
      change: 'Active zones',
      changeType: 'neutral',
      icon: MapPin,
      color: 'bg-destructive',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} variant="glass">
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card variant="glass" className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-success' :
                  stat.changeType === 'negative' ? 'text-destructive' :
                  'text-muted-foreground'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
