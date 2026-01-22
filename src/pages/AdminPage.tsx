import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Shield, 
  Settings,
  Search,
  MoreVertical,
  UserCheck,
  BarChart3,
  Layers
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { ReportGenerator } from '@/components/admin/ReportGenerator';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { useComplaintStats } from '@/hooks/useComplaints';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const AdminPage = () => {
  const { role, isAdmin, isAuthority } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: stats } = useComplaintStats();

  // Mock data for demo
  const mockUsers = [
    { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'citizen', complaints: 5 },
    { id: '2', name: 'Priya Patel', email: 'priya@example.com', role: 'citizen', complaints: 3 },
    { id: '3', name: 'Officer Kumar', email: 'kumar@gov.in', role: 'authority', complaints: 0 },
    { id: '4', name: 'Admin User', email: 'admin@civicguard.gov', role: 'admin', complaints: 0 },
  ];

  const handleRoleChange = (userId: string, newRole: string) => {
    toast.success(`User role updated to ${newRole}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage users, categories, generate reports, and system settings
            </p>
            <div className="mt-2">
              <Badge variant={isAdmin ? 'destructive' : 'info'}>
                {role?.toUpperCase()} ACCESS
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Complaints', value: stats?.totalComplaints || 0, icon: FileText, color: 'bg-accent' },
              { label: 'Pending', value: stats?.pendingComplaints || 0, icon: Users, color: 'bg-warning' },
              { label: 'Resolved', value: stats?.resolvedComplaints || 0, icon: UserCheck, color: 'bg-success' },
              { label: 'Resolution Rate', value: `${stats?.resolutionRate || 0}%`, icon: BarChart3, color: 'bg-info' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="reports" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Reports
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="categories" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Categories
                </TabsTrigger>
              )}
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              )}
            </TabsList>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <ReportGenerator />
            </TabsContent>

            {/* Categories Tab (Admin only) */}
            {isAdmin && (
              <TabsContent value="categories">
                <CategoryManager />
              </TabsContent>
            )}

            {/* Users Tab */}
            <TabsContent value="users">
              <Card variant="glass">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage user accounts and roles</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search users..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Complaints</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockUsers.map((user) => (
                          <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                user.role === 'admin' ? 'destructive' :
                                user.role === 'authority' ? 'info' : 'secondary'
                              }>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-foreground">{user.complaints}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isAdmin && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'citizen')}>
                                      <Users className="w-4 h-4 mr-2" />
                                      Set as Citizen
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'authority')}>
                                      <Shield className="w-4 h-4 mr-2" />
                                      Set as Authority
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                      <Settings className="w-4 h-4 mr-2" />
                                      Set as Admin
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab (Admin only) */}
            {isAdmin && (
              <TabsContent value="settings">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>Configure system-wide settings</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-12">
                    <Settings className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      System settings will be available here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
