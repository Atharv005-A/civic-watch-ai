import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDashboardStats } from '@/lib/mockData';

const stats = [
  {
    title: 'Total Complaints',
    value: mockDashboardStats.totalComplaints.toLocaleString(),
    change: '+12%',
    changeType: 'positive',
    icon: FileText,
    color: 'bg-accent',
  },
  {
    title: 'Pending',
    value: mockDashboardStats.pendingComplaints.toLocaleString(),
    change: '-5%',
    changeType: 'positive',
    icon: Clock,
    color: 'bg-warning',
  },
  {
    title: 'Resolved',
    value: mockDashboardStats.resolvedComplaints.toLocaleString(),
    change: '+8%',
    changeType: 'positive',
    icon: CheckCircle,
    color: 'bg-success',
  },
  {
    title: 'Avg. Resolution',
    value: `${mockDashboardStats.averageResolutionTime} days`,
    change: '-0.5 days',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'bg-info',
  },
  {
    title: 'Credibility Avg.',
    value: `${mockDashboardStats.credibilityAverage}%`,
    change: '+2%',
    changeType: 'positive',
    icon: Brain,
    color: 'bg-anonymous',
  },
  {
    title: 'Hotspot Areas',
    value: mockDashboardStats.hotspotAreas.length.toString(),
    change: 'Active zones',
    changeType: 'neutral',
    icon: MapPin,
    color: 'bg-destructive',
  },
];

export function StatsOverview() {
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
