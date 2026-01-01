import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Lock, 
  MapPin, 
  Upload, 
  Send,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocationMap } from '@/components/map/LocationMap';
import { CIVIC_CATEGORIES, ANONYMOUS_CATEGORIES } from '@/types/complaint';
import { generateAnonymousId } from '@/lib/mockData';
import { toast } from 'sonner';

interface ComplaintFormProps {
  defaultType?: 'civic' | 'anonymous';
}

export function ComplaintForm({ defaultType = 'civic' }: ComplaintFormProps) {
  const [reportType, setReportType] = useState<'civic' | 'anonymous'>(defaultType);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [anonymousId, setAnonymousId] = useState('');

  const categories = reportType === 'civic' ? CIVIC_CATEGORIES : ANONYMOUS_CATEGORIES;

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    
    if (!location) {
      toast.error('Please select a location on the map');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newAnonymousId = reportType === 'anonymous' ? generateAnonymousId() : '';
    setAnonymousId(newAnonymousId);
    setSubmitted(true);
    setIsSubmitting(false);

    toast.success('Complaint submitted successfully!');
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card variant="elevated" className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Complaint Submitted Successfully!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your complaint has been registered and will be reviewed by our AI system.
          </p>
          
          <div className="bg-muted/50 rounded-xl p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your Tracking ID</p>
            <p className="font-mono text-2xl font-bold text-accent">
              {reportType === 'anonymous' ? anonymousId : 'CIV-' + Math.random().toString(36).substring(2, 8).toUpperCase()}
            </p>
            {reportType === 'anonymous' && (
              <p className="text-xs text-muted-foreground mt-2">
                Save this ID to track your anonymous complaint
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="accent" onClick={() => {
              setSubmitted(false);
              setFormData({ title: '', description: '', name: '', email: '', phone: '' });
              setSelectedCategory('');
              setLocation(null);
            }}>
              Submit Another Complaint
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Track Status
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Report Type Toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={reportType === 'civic' ? 'accent' : 'outline'}
          size="lg"
          onClick={() => setReportType('civic')}
          className="gap-2"
        >
          <FileText className="w-5 h-5" />
          Civic Issue
        </Button>
        <Button
          variant={reportType === 'anonymous' ? 'anonymous' : 'outline'}
          size="lg"
          onClick={() => setReportType('anonymous')}
          className="gap-2"
        >
          <Lock className="w-5 h-5" />
          Anonymous Report
        </Button>
      </div>

      {/* Info Banner */}
      <div className={`mb-8 p-4 rounded-xl flex items-start gap-3 ${
        reportType === 'anonymous' 
          ? 'bg-anonymous/10 border border-anonymous/20' 
          : 'bg-accent/10 border border-accent/20'
      }`}>
        <Info className={`w-5 h-5 mt-0.5 ${reportType === 'anonymous' ? 'text-anonymous' : 'text-accent'}`} />
        <div>
          <h3 className="font-medium text-foreground mb-1">
            {reportType === 'anonymous' ? 'Anonymous Reporting' : 'Standard Civic Report'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {reportType === 'anonymous' 
              ? 'Your identity will be protected. No personal information is required. You will receive a unique tracking ID.'
              : 'Provide your contact details for updates. Your information is kept confidential.'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Category Selection */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Select Category</CardTitle>
            <CardDescription>Choose the type of issue you want to report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedCategory === category.id
                      ? reportType === 'anonymous'
                        ? 'border-anonymous bg-anonymous/10'
                        : 'border-accent bg-accent/10'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-2xl block mb-2">{category.icon}</span>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Complaint Details</CardTitle>
            <CardDescription>Provide details about the issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief title for your complaint"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Location
            </CardTitle>
            <CardDescription>Click on the map to select the issue location</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationMap 
              interactive 
              onLocationSelect={handleLocationSelect}
              className="mb-4"
            />
            {location && (
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Selected Location:</p>
                <p className="text-foreground font-medium">{location.address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info (only for civic reports) */}
        {reportType === 'civic' && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>Your details for receiving updates (optional)</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evidence Upload */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Evidence (Optional)</CardTitle>
            <CardDescription>Upload photos or documents to support your complaint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Max 5 files, up to 10MB each (JPG, PNG, PDF)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            variant={reportType === 'anonymous' ? 'anonymous' : 'hero'}
            size="xl"
            disabled={isSubmitting}
            className="min-w-[250px] gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Complaint
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
