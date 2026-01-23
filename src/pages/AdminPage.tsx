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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { ReportGenerator } from '@/components/admin/ReportGenerator';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { useComplaintStats } from '@/hooks/useComplaints';
import { useUsers, useUpdateUserRole } from '@/hooks/useUsers';
import { useSearch } from '@/hooks/useSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminPage = () => {
  const { role, isAdmin, isAuthority } = useAuth();
  const { data: stats } = useComplaintStats();
  const { data: users, isLoading: usersLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  
  const { searchQuery, setSearchQuery, filteredItems: filteredUsers } = useSearch(
    users || [],
    ['full_name', 'email', 'role']
  );

  const handleRoleChange = (userId: string, newRole: 'citizen' | 'authority' | 'admin') => {
    updateRole.mutate({ userId, newRole });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'authority': return 'warning';
      default: return 'secondary';
    }
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
                Admin Panel
              </h1>
              <p className="text-muted-foreground">
                Manage users, categories, and generate reports
              </p>
            </div>
            <Badge variant={getRoleBadgeVariant(role || 'citizen')} className="w-fit">
              <Shield className="w-3 h-3 mr-1" />
              {role?.toUpperCase()}
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold text-foreground">
                        {usersLoading ? <Skeleton className="h-8 w-16" /> : users?.length || 0}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Complaints</p>
                      <p className="text-3xl font-bold text-foreground">{stats?.totalComplaints || 0}</p>
                    </div>
                    <FileText className="w-10 h-10 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-3xl font-bold text-foreground">{stats?.resolvedComplaints || 0}</p>
                    </div>
                    <UserCheck className="w-10 h-10 text-success" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-3xl font-bold text-foreground">{stats?.pendingComplaints || 0}</p>
                    </div>
                    <BarChart3 className="w-10 h-10 text-info" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                User Management
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="categories" className="gap-2">
                    <Layers className="w-4 h-4" />
                    Categories
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Reports
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card variant="glass">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>View and manage user roles</CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
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
                  {usersLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No users match your search' : 'No users found'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((user) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                              <span className="font-medium text-accent">
                                {user.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {user.complaints_count} complaints
                            </span>
                            {isAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'citizen')}>
                                    Set as Citizen
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'authority')}>
                                    Set as Authority
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                    Set as Admin
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            {isAdmin && (
              <TabsContent value="categories">
                <CategoryManager />
              </TabsContent>
            )}

            {/* Reports Tab */}
            {isAdmin && (
              <TabsContent value="reports">
                <ReportGenerator />
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
