import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteContent {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  metadata: Record<string, any>;
  is_active: boolean;
}

export function useSiteContent(sectionKey: string) {
  return useQuery({
    queryKey: ['site-content', sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', sectionKey)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as SiteContent | null;
    },
  });
}

export function useAllSiteContent() {
  return useQuery({
    queryKey: ['site-content-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as SiteContent[];
    },
  });
}
