import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Map,
  Layers,
  Filter,
  Info,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationMap } from '@/components/map/LocationMap';
import { useComplaintsForMap } from '@/hooks/useComplaintsData';
import { useDynamicStats } from '@/hooks/useDynamicStats';

const HeatmapPage = () => {
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'civic' | 'anonymous'>('all');
  const { data: allMarkers, isLoading: markersLoading } = useComplaintsForMap();
  const { data: stats, isLoading: statsLoading } = useDynamicStats();

  const mapMarkers = (allMarkers || [])
    .filter(c => selectedLayer === 'all' || c.type === selectedLayer);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                Issue Heatmap
              </h1>
              <p className="text-muted-foreground">
                Visualize complaint density and identify hotspot areas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={selectedLayer === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedLayer('all')}
              >
                All Issues
              </Button>
              <Button 
                variant={selectedLayer === 'civic' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedLayer('civic')}
              >
                Civic
              </Button>
              <Button 
                variant={selectedLayer === 'anonymous' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedLayer('anonymous')}
              >
                Anonymous
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3"
            >
              <Card variant="glass" className="overflow-hidden">
                <CardContent className="p-0">
                  {markersLoading ? (
                    <Skeleton className="h-[600px] w-full" />
                  ) : (
                    <LocationMap 
                      markers={mapMarkers}
                      center={[28.6139, 77.2090]}
                      zoom={13}
                      className="h-[600px]"
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Hotspot Areas */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Hotspot Areas
                  </CardTitle>
                  <CardDescription>Areas with most complaints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {statsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))
                  ) : stats?.hotspotAreas?.length ? (
                    stats.hotspotAreas.map((area, index) => (
                      <div
                        key={area}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-warning/20 text-warning text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{area}</span>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hotspot data available yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* AI Predictions */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-info" />
                    AI Predictions
                  </CardTitle>
                  <CardDescription>Based on historical data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm font-medium text-warning">High Risk</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.hotspotAreas?.[0] || 'No data'} expected to have more issues
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                    <p className="text-sm font-medium text-info">Trend Alert</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalComplaints || 0} total complaints tracked
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Map Legend */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Map Legend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-accent" />
                    <span className="text-sm">Civic Issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-anonymous" />
                    <span className="text-sm">Anonymous Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-success" />
                    <span className="text-sm">Resolved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-warning" />
                    <span className="text-sm">Pending</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HeatmapPage;
