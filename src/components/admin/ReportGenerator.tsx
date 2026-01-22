import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileDown, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useComplaints, useComplaintStats, ComplaintFilters } from '@/hooks/useComplaints';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export function ReportGenerator() {
  const [filters, setFilters] = useState<ComplaintFilters>({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { data: complaints, isLoading, refetch } = useComplaints(filters);
  const { data: stats } = useComplaintStats();
  const { data: categories } = useCategories();
  
  const applyFilters = () => {
    const newFilters: ComplaintFilters = { ...filters };
    if (dateFrom) newFilters.dateFrom = new Date(dateFrom);
    if (dateTo) newFilters.dateTo = new Date(dateTo);
    setFilters(newFilters);
  };
  
  const clearFilters = () => {
    setFilters({});
    setDateFrom('');
    setDateTo('');
  };
  
  const exportToCSV = () => {
    if (!complaints || complaints.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = [
      'Complaint ID',
      'Type',
      'Category',
      'Title',
      'Description',
      'Status',
      'Priority',
      'Location',
      'Credibility Score',
      'Created At',
      'Reporter Name',
      'Department',
    ];
    
    const rows = complaints.map(c => [
      c.complaint_id,
      c.type,
      c.category,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.description.replace(/"/g, '""')}"`,
      c.status,
      c.priority,
      `"${c.location_address}"`,
      c.credibility_score,
      format(new Date(c.created_at), 'yyyy-MM-dd HH:mm'),
      c.reporter_name || 'Anonymous',
      c.department || 'Unassigned',
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };
  
  const categoryData = stats?.categoryBreakdown
    ? Object.entries(stats.categoryBreakdown)
        .map(([name, value]) => ({
          name: categories?.find(c => c.slug === name)?.name || name,
          value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    : [];
  
  const typeData = stats?.typeBreakdown
    ? [
        { name: 'Civic', value: stats.typeBreakdown.civic },
        { name: 'Anonymous', value: stats.typeBreakdown.anonymous },
        { name: 'Special', value: stats.typeBreakdown.special },
      ].filter(d => d.value > 0)
    : [];
  
  const priorityData = stats?.priorityBreakdown
    ? [
        { name: 'Low', value: stats.priorityBreakdown.low, fill: '#22c55e' },
        { name: 'Medium', value: stats.priorityBreakdown.medium, fill: '#f59e0b' },
        { name: 'High', value: stats.priorityBreakdown.high, fill: '#ef4444' },
        { name: 'Critical', value: stats.priorityBreakdown.critical, fill: '#7c3aed' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
          <CardDescription>Filter complaints to generate custom reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => setFilters({ ...filters, status: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Type</Label>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => setFilters({ ...filters, type: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="civic">Civic</SelectItem>
                  <SelectItem value="anonymous">Anonymous</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => setFilters({ ...filters, priority: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => setFilters({ ...filters, category: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by title or description"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={applyFilters} className="gap-2">
              <Filter className="w-4 h-4" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Clear
            </Button>
            <Button variant="accent" onClick={exportToCSV} className="gap-2 ml-auto">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Complaints</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalComplaints || 0}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.pendingComplaints || 0}</p>
                </div>
                <Calendar className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.resolvedComplaints || 0}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.resolutionRate || 0}%</p>
                </div>
                <PieChart className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Type Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Complaint Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Monthly Trend */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Priority Distribution */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={60} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Complaints Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Filtered Complaints ({complaints?.length || 0})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : complaints && complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 20).map((complaint) => (
                    <tr key={complaint.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-2 font-mono text-xs">{complaint.complaint_id}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          complaint.type === 'civic' ? 'bg-blue-500/10 text-blue-500' :
                          complaint.type === 'anonymous' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-pink-500/10 text-pink-500'
                        }`}>
                          {complaint.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 max-w-[200px] truncate">{complaint.title}</td>
                      <td className="py-3 px-2">{complaint.category}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          complaint.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                          complaint.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                          complaint.status === 'investigating' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          complaint.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                          complaint.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                          complaint.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {complaints.length > 20 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Showing 20 of {complaints.length} complaints. Export to CSV for full data.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No complaints found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
