import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ComplaintRow {
  id: string;
  complaint_id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  location_ward: string | null;
  status: string;
  priority: string;
  credibility_score: number;
  evidence: string[] | null;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  anonymous_id: string | null;
  reporter_id: string | null;
  assigned_to: string | null;
  department: string | null;
  resolution: string | null;
  ai_sentiment: string | null;
  ai_fake_probability: number | null;
  ai_urgency_score: number | null;
  ai_keywords: string[] | null;
  ai_suggested_department: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplaintFilters {
  status?: string;
  type?: string;
  category?: string;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export function useComplaints(filters?: ComplaintFilters) {
  const { isAdmin, isAuthority } = useAuth();
  
  return useQuery({
    queryKey: ['complaints', filters],
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ComplaintRow[];
    },
  });
}

export function useComplaintStats() {
  return useQuery({
    queryKey: ['complaint-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('status, type, priority, category, created_at');
      
      if (error) throw error;
      
      const complaints = data || [];
      
      const totalComplaints = complaints.length;
      const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
      const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
      const investigatingComplaints = complaints.filter(c => c.status === 'investigating').length;
      const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
      
      // Group by category
      const categoryBreakdown = complaints.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Group by type
      const typeBreakdown = {
        civic: complaints.filter(c => c.type === 'civic').length,
        anonymous: complaints.filter(c => c.type === 'anonymous').length,
        special: complaints.filter(c => c.type === 'special').length,
      };
      
      // Group by priority
      const priorityBreakdown = {
        low: complaints.filter(c => c.priority === 'low').length,
        medium: complaints.filter(c => c.priority === 'medium').length,
        high: complaints.filter(c => c.priority === 'high').length,
        critical: complaints.filter(c => c.priority === 'critical').length,
      };
      
      // Monthly trend (last 6 months)
      const now = new Date();
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const count = complaints.filter(c => {
          const date = new Date(c.created_at);
          return date >= month && date <= monthEnd;
        }).length;
        monthlyTrend.push({
          month: month.toLocaleDateString('en-US', { month: 'short' }),
          count,
        });
      }
      
      return {
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        investigatingComplaints,
        inProgressComplaints,
        categoryBreakdown,
        typeBreakdown,
        priorityBreakdown,
        monthlyTrend,
        resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0,
      };
    },
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ComplaintRow> }) => {
      const { error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
    },
  });
}
