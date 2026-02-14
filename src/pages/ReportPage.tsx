import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText, PieChart } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ComplaintForm } from '@/components/report/ComplaintForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';

const CATEGORY_COLORS = ['#3b82f6', '#ef4444', '#eab308', '#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];

const ReportPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'civic' | 'anonymous' | null;

  const { data: stats } = useQuery({
    queryKey: ['report-page-stats'],
    queryFn: async () => {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select('status, category, priority, created_at, ai_urgency_score');
      if (error) throw error;

      const total = complaints?.length || 0;
      const pending = complaints?.filter(c => c.status === 'pending').length || 0;
      const inProgress = complaints?.filter(c => c.status === 'in-progress').length || 0;
      const resolved = complaints?.filter(c => c.status === 'resolved').length || 0;
      const rejected = complaints?.filter(c => c.status === 'rejected').length || 0;

      // Category distribution
      const catMap: Record<string, number> = {};
      complaints?.forEach(c => { catMap[c.category] = (catMap[c.category] || 0) + 1; });
      const categoryData = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value], i) => ({ name: name.replace(/-/g, ' '), value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));

      // Priority distribution
      const priMap: Record<string, number> = {};
      complaints?.forEach(c => { priMap[c.priority] = (priMap[c.priority] || 0) + 1; });
      const priorityData = Object.entries(priMap).map(([name, value]) => ({ name, value }));

      // Status distribution for pie chart
      const statusData = [
        { name: 'Pending', value: pending, color: '#eab308' },
        { name: 'In Progress', value: inProgress, color: '#3b82f6' },
        { name: 'Resolved', value: resolved, color: '#22c55e' },
        { name: 'Rejected', value: rejected, color: '#ef4444' },
      ].filter(d => d.value > 0);

      // Monthly trend (last 6 months)
      const monthlyMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyMap[key] = 0;
      }
      complaints?.forEach(c => {
        const d = new Date(c.created_at);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (key in monthlyMap) monthlyMap[key]++;
      });
      const trendData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

      const avgUrgency = complaints?.filter(c => c.ai_urgency_score).reduce((s, c) => s + (c.ai_urgency_score || 0), 0) / (complaints?.filter(c => c.ai_urgency_score).length || 1);

      return { total, pending, inProgress, resolved, rejected, categoryData, priorityData, statusData, trendData, avgUrgency: Math.round(avgUrgency * 10) / 10 };
    },
  });

  const chartConfig = {
    count: { label: 'Complaints', color: 'hsl(var(--accent))' },
    value: { label: 'Count', color: 'hsl(var(--accent))' },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Report an Issue
            </h1>
            <p className="text-muted-foreground">
              Submit a civic issue or anonymous whistleblower complaint. 
              Your report will be verified by AI and forwarded to the appropriate authorities.
            </p>
          </div>

          {/* Quick Stats */}
          {stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Reports</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.resolved}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.avgUrgency}</p>
                    <p className="text-xs text-muted-foreground">Avg Urgency</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Category Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-accent" />
                      By Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[220px]">
                      <BarChart data={stats.categoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {stats.categoryData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Status Pie */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-accent" />
                      Status Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {stats.statusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-1">
                      {stats.statusData.map(s => (
                        <div key={s.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-xs text-muted-foreground">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Trend */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      Monthly Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[220px]">
                      <LineChart data={stats.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--accent))' }} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <ComplaintForm defaultType={type === 'anonymous' ? 'anonymous' : 'civic'} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportPage;
