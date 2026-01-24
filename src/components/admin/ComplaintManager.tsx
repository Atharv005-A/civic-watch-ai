import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MoreVertical,
  Trash2,
  UserPlus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useComplaintsData, ComplaintData } from '@/hooks/useComplaintsData';
import { useSearch } from '@/hooks/useSearch';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ComplaintDetailModal } from '@/components/dashboard/ComplaintDetailModal';
import { getStatusColor, getPriorityColor } from '@/lib/mockData';

export function ComplaintManager() {
  const { data: complaints, isLoading } = useComplaintsData();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [assignWorker, setAssignWorker] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { searchQuery, setSearchQuery, filteredItems } = useSearch(
    complaints || [],
    ['title', 'complaint_id', 'location_address', 'category', 'status']
  );

  const handleViewDetails = (complaint: ComplaintData) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const handleAssignWorker = (complaint: ComplaintData) => {
    setSelectedComplaint(complaint);
    setAssignWorker('');
    setShowAssignModal(true);
  };

  const handleChangeStatus = (complaint: ComplaintData) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResolution('');
    setShowStatusModal(true);
  };

  const handleDeleteComplaint = (complaint: ComplaintData) => {
    setSelectedComplaint(complaint);
    setShowDeleteModal(true);
  };

  const confirmAssign = async () => {
    if (!selectedComplaint || !assignWorker.trim()) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ assigned_worker_name: assignWorker.trim() })
        .eq('id', selectedComplaint.id);
      
      if (error) throw error;
      
      toast.success(`Assigned to ${assignWorker}`);
      queryClient.invalidateQueries({ queryKey: ['complaints-data'] });
      setShowAssignModal(false);
    } catch (error: any) {
      toast.error('Failed to assign worker: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedComplaint || !newStatus) return;
    
    setActionLoading(true);
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'resolved' && resolution.trim()) {
        updates.resolution = resolution.trim();
      }
      
      const { error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', selectedComplaint.id);
      
      if (error) throw error;
      
      toast.success(`Status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['complaints-data'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-stats'] });
      setShowStatusModal(false);
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedComplaint) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', selectedComplaint.id);
      
      if (error) throw error;
      
      toast.success('Complaint deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['complaints-data'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-stats'] });
      setShowDeleteModal(false);
    } catch (error: any) {
      toast.error('Failed to delete complaint: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'investigating':
        return <AlertTriangle className="w-4 h-4 text-info" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Card variant="glass">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Complaint Management</CardTitle>
              <CardDescription>
                View, assign workers, change status, and manage all complaints
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No complaints match your search' : 'No complaints found'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((complaint) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getStatusIcon(complaint.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-xs text-muted-foreground">
                          {complaint.complaint_id}
                        </p>
                        <Badge variant={getStatusColor(complaint.status as any) as any} className="text-xs">
                          {complaint.status}
                        </Badge>
                        <Badge variant={getPriorityColor(complaint.priority as any) as any} className="text-xs">
                          {complaint.priority}
                        </Badge>
                      </div>
                      <p className="font-medium truncate">{complaint.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {complaint.location_address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleViewDetails(complaint)}
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAssignWorker(complaint)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign Worker
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(complaint)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteComplaint(complaint)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Complaint
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      {/* Assign Worker Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Worker</DialogTitle>
            <DialogDescription>
              Assign a worker to handle this complaint: {selectedComplaint?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="worker">Worker Name</Label>
              <Input
                id="worker"
                placeholder="Enter worker name..."
                value={assignWorker}
                onChange={(e) => setAssignWorker(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssign} disabled={actionLoading || !assignWorker.trim()}>
              {actionLoading ? 'Assigning...' : 'Assign Worker'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Update the status of: {selectedComplaint?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus === 'resolved' && (
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Notes</Label>
                <Input
                  id="resolution"
                  placeholder="Describe how the issue was resolved..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} disabled={actionLoading}>
              {actionLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Complaint</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="font-mono text-xs text-muted-foreground mb-1">
                {selectedComplaint?.complaint_id}
              </p>
              <p className="font-medium">{selectedComplaint?.title}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Complaint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
