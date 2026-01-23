import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  List, 
  Map,
  Download,
  RefreshCw
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ComplaintsList } from '@/components/dashboard/ComplaintsList';
import { LocationMap } from '@/components/map/LocationMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useComplaintsForMap, useComplaintsData } from '@/hooks/useComplaintsData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const DashboardPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const { data: mapMarkers, isLoading: markersLoading } = useComplaintsForMap();
  const { data: complaints } = useComplaintsData();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['complaints-data'] });
    queryClient.invalidateQueries({ queryKey: ['complaints-map'] });
    queryClient.invalidateQueries({ queryKey: ['dynamic-stats'] });
    toast.success('Data refreshed');
  };

  const handleExport = () => {
    if (!complaints || complaints.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['ID', 'Type', 'Category', 'Title', 'Status', 'Priority', 'Location', 'Created'];
    const rows = complaints.map(c => [
      c.complaint_id,
      c.type,
      c.category,
      `"${c.title.replace(/"/g, '""')}"`,
      c.status,
      c.priority,
      `"${c.location_address}"`,
      new Date(c.created_at).toLocaleDateString(),
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export complete');
  };

  // Filter complaints by status
  const filterByStatus = (status: string | null) => {
    if (!complaints) return [];
    if (status === null) return complaints;
    if (status === 'anonymous') return complaints.filter(c => c.type === 'anonymous');
    return complaints.filter(c => c.status === status);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor complaints, track resolutions, and analyze trends
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <StatsOverview />
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="complaints" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="complaints">All Complaints</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="anonymous">Anonymous</TabsTrigger>
              </TabsList>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('map')}
                  className="h-8 w-8"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="complaints" className="mt-0">
              {viewMode === 'map' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {markersLoading ? (
                    <Skeleton className="h-[600px] w-full rounded-xl" />
                  ) : (
                    <LocationMap 
                      markers={mapMarkers || []}
                      zoom={11}
                      className="h-[600px]"
                    />
                  )}
                </motion.div>
              ) : (
                <ComplaintsList />
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              {viewMode === 'map' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <LocationMap 
                    markers={(mapMarkers || []).filter(m => m.status === 'pending')}
                    zoom={11}
                    className="h-[600px]"
                  />
                </motion.div>
              ) : (
                <ComplaintsList />
              )}
            </TabsContent>

            <TabsContent value="resolved" className="mt-0">
              {viewMode === 'map' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <LocationMap 
                    markers={(mapMarkers || []).filter(m => m.status === 'resolved')}
                    zoom={11}
                    className="h-[600px]"
                  />
                </motion.div>
              ) : (
                <ComplaintsList />
              )}
            </TabsContent>

            <TabsContent value="anonymous" className="mt-0">
              {viewMode === 'map' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <LocationMap 
                    markers={(mapMarkers || []).filter(m => m.type === 'anonymous')}
                    zoom={11}
                    className="h-[600px]"
                  />
                </motion.div>
              ) : (
                <ComplaintsList />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
