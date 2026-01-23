import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ComplaintData {
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
  reporter_id: string | null;
  anonymous_id: string | null;
  department: string | null;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  ai_sentiment: string | null;
  ai_fake_probability: number | null;
  ai_keywords: string[] | null;
  ai_urgency_score: number | null;
  ai_suggested_department: string | null;
}

export function useComplaintsData() {
  return useQuery({
    queryKey: ['complaints-data'],
    queryFn: async (): Promise<ComplaintData[]> => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useComplaintsForMap() {
  return useQuery({
    queryKey: ['complaints-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('id, title, type, status, location_lat, location_lng, location_address');
      
      if (error) throw error;
      
      return (data || []).map(c => ({
        position: [c.location_lat, c.location_lng] as [number, number],
        title: c.title,
        type: c.type as 'civic' | 'anonymous',
        status: c.status,
      }));
    },
  });
}
