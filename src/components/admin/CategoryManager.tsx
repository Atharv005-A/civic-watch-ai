import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAllCategories, ComplaintCategory } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function CategoryManager() {
  const { data: categories, isLoading } = useAllCategories();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    type: 'civic' as 'civic' | 'anonymous' | 'special',
    description: '',
    slug: '',
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      type: 'civic',
      description: '',
      slug: '',
      is_active: true,
      display_order: 0,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (category: ComplaintCategory) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      type: category.type,
      description: category.description,
      slug: category.slug,
      is_active: category.is_active,
      display_order: category.display_order,
    });
    setEditingId(category.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.icon || !formData.slug) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('complaint_categories')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('complaint_categories')
          .insert(formData);
        
        if (error) throw error;
        toast.success('Category created successfully');
      }
      
      queryClient.invalidateQueries({ queryKey: ['complaint-categories'] });
      resetForm();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const { error } = await supabase
        .from('complaint_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['complaint-categories'] });
      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('complaint_categories')
        .update({ is_active: !currentActive })
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['complaint-categories'] });
      toast.success(`Category ${!currentActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast.error(error.message || 'Failed to update category');
    }
  };

  const groupedCategories = categories?.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {} as Record<string, ComplaintCategory[]>) || {};

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Category' : 'Add New Category'}</CardTitle>
              <CardDescription>
                {editingId ? 'Update the category details' : 'Create a new complaint category'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Label>Icon (Emoji) *</Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🏷️"
                  />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'civic' | 'anonymous' | 'special') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="civic">Civic</SelectItem>
                      <SelectItem value="anonymous">Anonymous</SelectItem>
                      <SelectItem value="special">Special (Women/Children/Disabled)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={resetForm} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      )}

      {/* Categories by Type */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
      ) : (
        ['civic', 'anonymous', 'special'].map((type) => (
          <Card key={type} variant="glass">
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                {type === 'civic' && '🏙️'}
                {type === 'anonymous' && '🔒'}
                {type === 'special' && '⚡'}
                {type} Categories
              </CardTitle>
              <CardDescription>
                {type === 'special' 
                  ? 'Special categories for children, women, and disabled persons'
                  : `Manage ${type} complaint categories`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupedCategories[type]?.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      category.is_active ? 'bg-muted/50' : 'bg-muted/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() => toggleActive(category.id, category.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {!groupedCategories[type]?.length && (
                  <p className="text-center py-4 text-muted-foreground">
                    No {type} categories yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
