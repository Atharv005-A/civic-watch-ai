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
  RefreshCw,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useComplaints, useComplaintStats, ComplaintFilters } from '@/hooks/useComplaints';
import { useCategories } from '@/hooks/useCategories';
import { useUsers } from '@/hooks/useUsers';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  investigating: '#8b5cf6',
  resolved: '#22c55e',
  rejected: '#ef4444',
};

export function ReportGenerator() {
  const [filters, setFilters] = useState<ComplaintFilters>({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  
  const { data: complaints, isLoading, refetch } = useComplaints(filters);
  const { data: stats } = useComplaintStats();
  const { data: categories } = useCategories();
  const { data: users } = useUsers();
  
  const applyFilters = () => {
    const newFilters: ComplaintFilters = { ...filters };
    if (dateFrom) newFilters.dateFrom = new Date(dateFrom);
    if (dateTo) newFilters.dateTo = new Date(dateTo);
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setFilters({});
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };
  
  const exportToCSV = () => {
    if (!complaints || complaints.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = [
      'Complaint ID', 'Type', 'Category', 'Title', 'Description', 'Status', 'Priority',
      'Location', 'Ward', 'Credibility Score', 'AI Urgency', 'AI Sentiment',
      'AI Fake Probability', 'AI Suggested Dept', 'Reporter Name', 'Reporter Email',
      'Department', 'Assigned Worker', 'Resolution', 'Created At', 'Updated At',
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
      c.location_ward || '',
      c.credibility_score,
      c.ai_urgency_score || '',
      c.ai_sentiment || '',
      c.ai_fake_probability || '',
      c.ai_suggested_department || '',
      c.reporter_name || 'Anonymous',
      c.reporter_email || '',
      c.department || 'Unassigned',
      (c as any).assigned_worker_name || '',
      `"${(c.resolution || '').replace(/"/g, '""')}"`,
      format(new Date(c.created_at), 'yyyy-MM-dd HH:mm'),
      format(new Date(c.updated_at), 'yyyy-MM-dd HH:mm'),
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${complaints.length} complaints to CSV`);
  };
  
  const categoryData = stats?.categoryBreakdown
    ? Object.entries(stats.categoryBreakdown)
        .map(([name, value]) => ({
          name: categories?.find(c => c.slug === name)?.name || name.replace(/-/g, ' '),
          value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    : [];
  
  const typeData = stats?.typeBreakdown
    ? [
        { name: 'Civic', value: stats.typeBreakdown.civic, color: '#3b82f6' },
        { name: 'Anonymous', value: stats.typeBreakdown.anonymous, color: '#8b5cf6' },
        { name: 'Special', value: stats.typeBreakdown.special, color: '#ec4899' },
      ].filter(d => d.value > 0)
    : [];
  
  const priorityData = stats?.priorityBreakdown
    ? [
        { name: 'Low', value: stats.priorityBreakdown.low, color: '#22c55e' },
        { name: 'Medium', value: stats.priorityBreakdown.medium, color: '#f59e0b' },
        { name: 'High', value: stats.priorityBreakdown.high, color: '#ef4444' },
        { name: 'Critical', value: stats.priorityBreakdown.critical, color: '#7c3aed' },
      ]
    : [];

  const statusData = [
    { name: 'Pending', value: stats?.pendingComplaints || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats?.inProgressComplaints || 0, color: '#3b82f6' },
    { name: 'Investigating', value: stats?.investigatingComplaints || 0, color: '#8b5cf6' },
    { name: 'Resolved', value: stats?.resolvedComplaints || 0, color: '#22c55e' },
  ].filter(d => d.value > 0);

  // Paginated complaints
  const totalPages = Math.ceil((complaints?.length || 0) / pageSize);
  const paginatedComplaints = complaints?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      'in-progress': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
      investigating: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
      resolved: 'bg-green-500/15 text-green-500 border-green-500/30',
      rejected: 'bg-red-500/15 text-red-500 border-red-500/30',
    };
    return variants[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'bg-green-500/15 text-green-500 border-green-500/30',
      medium: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      high: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
      critical: 'bg-red-500/15 text-red-500 border-red-500/30',
    };
    return variants[priority] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <FileText className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.totalComplaints || 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.pendingComplaints || 0}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Shield className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.investigatingComplaints || 0}</p>
              <p className="text-xs text-muted-foreground">Investigating</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.inProgressComplaints || 0}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.resolvedComplaints || 0}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats?.resolutionRate || 0}%</p>
              <p className="text-xs text-muted-foreground">Resolution Rate</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Area Chart */}
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-accent" />
              Monthly Complaints Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats?.monthlyTrend || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#colorCount)" dot={{ fill: 'hsl(var(--accent))', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="w-5 h-5 text-accent" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Bar Chart */}
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-accent" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type Distribution Pie */}
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="w-5 h-5 text-accent" />
              Complaint Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RechartsPieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Bar Chart */}
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-accent" />
              Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Summary */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Platform Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Users className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{users?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Registered Users</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <MapPin className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{categories?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Active Categories</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <FileText className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.typeBreakdown?.civic || 0}</p>
              <p className="text-xs text-muted-foreground">Civic Reports</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Shield className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.typeBreakdown?.anonymous || 0}</p>
              <p className="text-xs text-muted-foreground">Anonymous Reports</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters & Export
          </CardTitle>
          <CardDescription>Filter complaints and export well-formatted reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Status</Label>
              <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
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
              <Select value={filters.type || 'all'} onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="civic">Civic</SelectItem>
                  <SelectItem value="anonymous">Anonymous</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={filters.priority || 'all'} onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue placeholder="All Priorities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={filters.category || 'all'} onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Date From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>Date To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div>
              <Label>Search</Label>
              <Input placeholder="Search by title or description" value={filters.search || ''} onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })} />
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
              Export CSV ({complaints?.length || 0} records)
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Well-designed Complaints Table */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Complaints Data ({complaints?.length || 0} total)
            </CardTitle>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading complaints data...</div>
          ) : paginatedComplaints.length > 0 ? (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold w-[100px]">ID</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Credibility</TableHead>
                      <TableHead className="font-semibold">Reporter</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedComplaints.map((c, i) => (
                      <TableRow key={c.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{c.complaint_id}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <span className="truncate block font-medium">{c.title}</span>
                        </TableCell>
                        <TableCell className="text-sm capitalize">{c.category.replace(/-/g, ' ')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            c.type === 'civic' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                            c.type === 'anonymous' ? 'bg-purple-500/10 text-purple-500 border-purple-500/30' :
                            'bg-pink-500/10 text-pink-500 border-pink-500/30'
                          }>
                            {c.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(c.status)}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityBadge(c.priority)}>
                            {c.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${
                              c.credibility_score >= 80 ? 'bg-green-500' :
                              c.credibility_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm">{c.credibility_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{c.reporter_name || 'Anonymous'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(c.created_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, complaints?.length || 0)} of {complaints?.length || 0}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                      if (page < 1 || page > totalPages) return null;
                      return (
                        <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)}>
                          {page}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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
