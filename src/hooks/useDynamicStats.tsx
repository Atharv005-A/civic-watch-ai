import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  credibilityAverage: number;
  hotspotAreas: string[];
}

export function useDynamicStats() {
  return useQuery({
    queryKey: ['dynamic-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select('*');
      
      if (error) throw error;

      const total = complaints?.length || 0;
      const pending = complaints?.filter(c => c.status === 'pending').length || 0;
      const resolved = complaints?.filter(c => c.status === 'resolved').length || 0;
      
      // Calculate average credibility
      const avgCredibility = total > 0
        ? complaints.reduce((sum, c) => sum + (c.credibility_score || 0), 0) / total
        : 0;

      // Calculate average resolution time (mock for now since we don't track resolution date separately)
      const avgResolutionTime = resolved > 0 ? 3.5 : 0;

      // Get hotspot areas (wards with most complaints)
      const wardCounts = new Map<string, number>();
      complaints?.forEach(c => {
        if (c.location_ward) {
          wardCounts.set(c.location_ward, (wardCounts.get(c.location_ward) || 0) + 1);
        }
      });
      
      const hotspots = Array.from(wardCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([ward]) => ward);

      return {
        totalComplaints: total,
        pendingComplaints: pending,
        resolvedComplaints: resolved,
        averageResolutionTime: avgResolutionTime,
        credibilityAverage: Math.round(avgCredibility * 10) / 10,
        hotspotAreas: hotspots.length > 0 ? hotspots : ['No data yet'],
      };
    },
  });
}

export function useHeroStats() {
  return useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select('status');
      
      if (error) throw error;

      const total = complaints?.length || 0;
      const resolved = complaints?.filter(c => c.status === 'resolved').length || 0;
      const active = complaints?.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length || 0;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      // Get unique reporters count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      return {
        issuesResolved: resolved,
        activeReports: active,
        citizensServed: usersCount || 0,
        resolutionRate: resolutionRate || 0,
      };
    },
  });
}
