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
import { LocationMap } from '@/components/map/LocationMap';
import { mockComplaints, mockDashboardStats } from '@/lib/mockData';

const HeatmapPage = () => {
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'civic' | 'anonymous'>('all');

  const mapMarkers = mockComplaints
    .filter(c => selectedLayer === 'all' || c.type === selectedLayer)
    .map(c => ({
      position: [c.location.lat, c.location.lng] as [number, number],
      title: c.title,
      type: c.type,
      status: c.status,
    }));

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
                Visualize issue density and predict high-risk areas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant={selectedLayer === 'all' ? 'accent' : 'outline'} 
                size="sm"
                onClick={() => setSelectedLayer('all')}
              >
                All Issues
              </Button>
              <Button 
                variant={selectedLayer === 'civic' ? 'accent' : 'outline'} 
                size="sm"
                onClick={() => setSelectedLayer('civic')}
              >
                Civic
              </Button>
              <Button 
                variant={selectedLayer === 'anonymous' ? 'anonymous' : 'outline'} 
                size="sm"
                onClick={() => setSelectedLayer('anonymous')}
              >
                Anonymous
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-3">
              <Card variant="glass">
                <CardContent className="p-0">
                  <LocationMap 
                    center={[28.6139, 77.2090]}
                    markers={mapMarkers}
                    zoom={13}
                    className="h-[600px] rounded-xl"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Hotspot Areas */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Hotspot Areas
                  </CardTitle>
                  <CardDescription>Areas with high issue concentration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockDashboardStats.hotspotAreas.map((area, index) => (
                    <motion.div
                      key={area}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-destructive' :
                          index === 1 ? 'bg-warning' :
                          'bg-info'
                        }`} />
                        <span className="text-sm font-medium text-foreground">{area}</span>
                      </div>
                      <Badge variant={index === 0 ? 'urgent' : index === 1 ? 'warning' : 'info'}>
                        {Math.floor(Math.random() * 20 + 10)} issues
                      </Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Predictions */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    AI Predictions
                  </CardTitle>
                  <CardDescription>Predicted issues for next week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <h4 className="font-medium text-foreground mb-1">⚠️ Pothole Surge Expected</h4>
                    <p className="text-xs text-muted-foreground">
                      Ward 12 likely to see 40% increase in pothole reports due to recent rainfall.
                    </p>
                  </div>
                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                    <h4 className="font-medium text-foreground mb-1">📊 Trend Analysis</h4>
                    <p className="text-xs text-muted-foreground">
                      Garbage complaints typically spike on weekends. Suggest extra coverage.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-muted-foreground" />
                    Map Legend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-accent" />
                    <span className="text-sm text-muted-foreground">Civic Issues</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-anonymous" />
                    <span className="text-sm text-muted-foreground">Anonymous Reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">Resolved</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-warning" />
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HeatmapPage;
