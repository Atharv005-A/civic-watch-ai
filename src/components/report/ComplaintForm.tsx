import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Lock, 
  MapPin, 
  Upload, 
  Send,
  AlertTriangle,
  CheckCircle,
  Info,
  Brain,
  Shield,
  TrendingUp,
  X,
  ImageIcon,
  Heart,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationMap } from '@/components/map/LocationMap';
import { useCivicCategories, useAnonymousCategories, useSpecialCategories, ComplaintCategory } from '@/hooks/useCategories';
import { generateAnonymousId } from '@/lib/mockData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  fakeProbability: number;
  credibilityScore: number;
  keywords: string[];
  suggestedDepartment: string;
  urgencyScore: number;
  summary: string;
}

interface UploadedFile {
  file: File;
  preview: string;
}

interface ComplaintFormProps {
  defaultType?: 'civic' | 'anonymous' | 'special';
  defaultCategory?: string;
}

export function ComplaintForm({ defaultType = 'civic', defaultCategory }: ComplaintFormProps) {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  
  const [reportType, setReportType] = useState<'civic' | 'anonymous' | 'special'>(defaultType);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory || urlCategory || '');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    name: '',
    email: '',
    phone: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [anonymousId, setAnonymousId] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [complaintId, setComplaintId] = useState('');

  const { data: civicCategories, isLoading: civicLoading } = useCivicCategories();
  const { data: anonymousCategories, isLoading: anonLoading } = useAnonymousCategories();
  const { data: specialCategories, isLoading: specialLoading } = useSpecialCategories();

  const isLoadingCategories = civicLoading || anonLoading || specialLoading;

  const categories: ComplaintCategory[] = 
    reportType === 'civic' ? (civicCategories || []) : 
    reportType === 'anonymous' ? (anonymousCategories || []) : 
    (specialCategories || []);

  // Update report type if URL has category from special
  useEffect(() => {
    if (urlCategory && specialCategories?.some(c => c.slug === urlCategory)) {
      setReportType('special');
    }
  }, [urlCategory, specialCategories]);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = [];
    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Use JPG, PNG, WebP or PDF`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large. Max 10MB`);
        return;
      }

      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : '';
      newFiles.push({ file, preview });
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadEvidenceFiles = async (complaintId: string): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const { file } of uploadedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${complaintId}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('complaint-evidence')
        .upload(fileName, file);
      
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from('complaint-evidence')
        .getPublicUrl(fileName);
      
      urls.push(urlData.publicUrl);
    }
    
    return urls;
  };

  const analyzeComplaint = async (): Promise<AIAnalysis | null> => {
    try {
      setIsAnalyzing(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-complaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: selectedCategory,
          type: reportType,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('AI service is busy. Please try again in a moment.');
          return null;
        }
        throw new Error('Failed to analyze complaint');
      }

      const analysis = await response.json();
      setAiAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('AI analysis failed. Submitting with default scores.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
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
    setIsUploading(false);

    try {
      // Run AI analysis
      const analysis = await analyzeComplaint();

      // Generate complaint ID
      const newAnonymousId = reportType === 'anonymous' ? generateAnonymousId() : '';
      const newComplaintId = reportType === 'anonymous' 
        ? newAnonymousId 
        : 'CIV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Upload evidence files
      let evidenceUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        setIsUploading(true);
        evidenceUrls = await uploadEvidenceFiles(newComplaintId);
        setIsUploading(false);
      }

      // Determine priority based on urgency score
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      if (analysis) {
        if (analysis.urgencyScore >= 8) priority = 'critical';
        else if (analysis.urgencyScore >= 6) priority = 'high';
        else if (analysis.urgencyScore >= 4) priority = 'medium';
        else priority = 'low';
      }

      // Insert complaint into database
      const { error } = await supabase.from('complaints').insert({
        complaint_id: newComplaintId,
        type: reportType,
        category: selectedCategory,
        title: formData.title,
        description: formData.description,
        location_lat: location.lat,
        location_lng: location.lng,
        location_address: location.address,
        status: 'pending',
        priority,
        credibility_score: analysis?.credibilityScore ?? 70,
        reporter_name: reportType === 'civic' ? formData.name || null : null,
        reporter_email: reportType === 'civic' ? formData.email || null : null,
        reporter_phone: reportType === 'civic' ? formData.phone || null : null,
        anonymous_id: reportType === 'anonymous' ? newAnonymousId : null,
        ai_sentiment: analysis?.sentiment ?? null,
        ai_fake_probability: analysis?.fakeProbability ?? null,
        ai_urgency_score: analysis?.urgencyScore ?? null,
        ai_keywords: analysis?.keywords ?? null,
        ai_suggested_department: analysis?.suggestedDepartment ?? null,
        evidence: evidenceUrls.length > 0 ? evidenceUrls : null,
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save complaint');
      }

      setAnonymousId(newAnonymousId);
      setComplaintId(newComplaintId);
      setSubmitted(true);
      toast.success('Complaint submitted and analyzed successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            Your complaint has been analyzed by our AI system and registered.
          </p>
          
          <div className="bg-muted/50 rounded-xl p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your Tracking ID</p>
            <p className="font-mono text-2xl font-bold text-accent">
              {complaintId}
            </p>
            {reportType === 'anonymous' && (
              <p className="text-xs text-muted-foreground mt-2">
                Save this ID to track your anonymous complaint
              </p>
            )}
          </div>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="bg-muted/30 rounded-xl p-6 mb-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">AI Analysis Results</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-success" />
                    <span className="text-xs text-muted-foreground">Credibility Score</span>
                  </div>
                  <p className={`text-xl font-bold ${
                    aiAnalysis.credibilityScore >= 70 ? 'text-success' : 
                    aiAnalysis.credibilityScore >= 40 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {aiAnalysis.credibilityScore}%
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Urgency Level</span>
                  </div>
                  <p className={`text-xl font-bold ${
                    aiAnalysis.urgencyScore >= 7 ? 'text-destructive' : 
                    aiAnalysis.urgencyScore >= 4 ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {aiAnalysis.urgencyScore}/10
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Suggested Department</p>
                <p className="text-sm font-medium text-foreground">{aiAnalysis.suggestedDepartment}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.keywords.map((keyword, idx) => (
                    <span key={idx} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="accent" onClick={() => {
              setSubmitted(false);
              setFormData({ title: '', description: '', name: '', email: '', phone: '' });
              setSelectedCategory('');
              setLocation(null);
              setAiAnalysis(null);
              setComplaintId('');
              uploadedFiles.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
              setUploadedFiles([]);
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
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Button
          variant={reportType === 'civic' ? 'accent' : 'outline'}
          size="lg"
          onClick={() => { setReportType('civic'); setSelectedCategory(''); }}
          className="gap-2"
        >
          <FileText className="w-5 h-5" />
          Civic Issue
        </Button>
        <Button
          variant={reportType === 'anonymous' ? 'anonymous' : 'outline'}
          size="lg"
          onClick={() => { setReportType('anonymous'); setSelectedCategory(''); }}
          className="gap-2"
        >
          <Lock className="w-5 h-5" />
          Anonymous
        </Button>
        <Button
          variant={reportType === 'special' ? 'default' : 'outline'}
          size="lg"
          onClick={() => { setReportType('special'); setSelectedCategory(''); }}
          className={`gap-2 ${reportType === 'special' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600' : ''}`}
        >
          <Heart className="w-5 h-5" />
          Special Report
        </Button>
      </div>

      {/* Info Banner */}
      <div className={`mb-8 p-4 rounded-xl flex items-start gap-3 ${
        reportType === 'anonymous' ? 'bg-anonymous/10 border border-anonymous/20' : 
        reportType === 'special' ? 'bg-pink-500/10 border border-pink-500/20' :
        'bg-accent/10 border border-accent/20'
      }`}>
        <Info className={`w-5 h-5 mt-0.5 ${reportType === 'anonymous' ? 'text-anonymous' : reportType === 'special' ? 'text-pink-500' : 'text-accent'}`} />
        <div>
          <h3 className="font-medium text-foreground mb-1">
            {reportType === 'anonymous' ? 'Anonymous Reporting' : 
             reportType === 'special' ? 'Special Protection Report' : 'Standard Civic Report'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {reportType === 'anonymous' 
              ? 'Your identity will be protected. No personal information is required.'
              : reportType === 'special'
              ? 'Report issues related to women, children, or disabled persons. These are handled with priority.'
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
            {isLoadingCategories ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array(8).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedCategory === category.slug
                        ? reportType === 'anonymous' ? 'border-anonymous bg-anonymous/10'
                        : reportType === 'special' ? 'border-pink-500 bg-pink-500/10'
                        : 'border-accent bg-accent/10'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{category.icon}</span>
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                  </button>
                ))}
              </div>
            )}
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

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-accent" />
              Evidence (Optional)
            </CardTitle>
            <CardDescription>Upload photos or documents to support your complaint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-accent', 'bg-accent/5');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-accent', 'bg-accent/5');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-accent', 'bg-accent/5');
                const dt = e.dataTransfer;
                if (dt.files) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dataTransfer = new DataTransfer();
                    Array.from(dt.files).forEach(f => dataTransfer.items.add(f));
                    input.files = dataTransfer.files;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }
              }}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Max 5 files, up to 10MB each (JPG, PNG, WebP, PDF)
              </p>
            </div>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      {file.preview ? (
                        <img 
                          src={file.preview} 
                          alt={file.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2">
                          <FileText className="w-8 h-8 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground text-center truncate w-full">
                            {file.file.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-center gap-3">
          <Button
            type="submit"
            variant={reportType === 'anonymous' ? 'anonymous' : 'hero'}
            size="xl"
            disabled={isSubmitting || isAnalyzing || isUploading}
            className="min-w-[250px] gap-2"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-5 h-5 animate-pulse" />
                Analyzing with AI...
              </>
            ) : isUploading ? (
              <>
                <Upload className="w-5 h-5 animate-bounce" />
                Uploading Evidence...
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Complaint
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Brain className="w-3 h-3" />
            Your complaint will be analyzed by AI for credibility and routing
          </p>
        </div>
      </form>
    </motion.div>
  );
}
