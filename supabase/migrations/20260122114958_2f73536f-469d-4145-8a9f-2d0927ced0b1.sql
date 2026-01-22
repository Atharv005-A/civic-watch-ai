-- Create complaint_categories table for dynamic categories
CREATE TABLE public.complaint_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('civic', 'anonymous', 'special')),
  description TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.complaint_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.complaint_categories FOR SELECT
USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.complaint_categories FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_complaint_categories_updated_at
BEFORE UPDATE ON public.complaint_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert civic categories
INSERT INTO public.complaint_categories (name, icon, type, description, slug, display_order) VALUES
('Pothole', '🕳️', 'civic', 'Road damage or potholes', 'pothole', 1),
('Garbage Overflow', '🗑️', 'civic', 'Overflowing garbage bins', 'garbage', 2),
('Water Leakage', '💧', 'civic', 'Water pipe leaks or flooding', 'water', 3),
('Streetlight', '💡', 'civic', 'Non-functional street lights', 'streetlight', 4),
('Traffic Signal', '🚦', 'civic', 'Traffic signal issues', 'traffic', 5),
('Drainage', '🌊', 'civic', 'Blocked or broken drains', 'drainage', 6),
('Road Damage', '🛣️', 'civic', 'Road surface damage', 'road', 7),
('Other Civic', '📋', 'civic', 'Other civic issues', 'other-civic', 8);

-- Insert anonymous categories
INSERT INTO public.complaint_categories (name, icon, type, description, slug, display_order) VALUES
('Corruption', '💰', 'anonymous', 'Report corrupt practices', 'corruption', 1),
('Harassment', '⚠️', 'anonymous', 'Report harassment incidents', 'harassment', 2),
('Threats/Violence', '🚨', 'anonymous', 'Report threats or violence', 'threat', 3),
('Fraud', '📄', 'anonymous', 'Report fraudulent activities', 'fraud', 4),
('Misconduct', '👤', 'anonymous', 'Report official misconduct', 'misconduct', 5),
('Unsafe Area', '🔴', 'anonymous', 'Report unsafe public areas', 'unsafe', 6),
('Other Anonymous', '🔒', 'anonymous', 'Other sensitive issues', 'other-anon', 7);

-- Insert special categories (children, women, disabled)
INSERT INTO public.complaint_categories (name, icon, type, description, slug, display_order) VALUES
('Child Abuse', '👶', 'special', 'Report child abuse or neglect', 'child-abuse', 1),
('Child Labor', '🧒', 'special', 'Report child labor violations', 'child-labor', 2),
('Missing Child', '🔍', 'special', 'Report missing children', 'missing-child', 3),
('Child Safety', '🛡️', 'special', 'Report child safety concerns', 'child-safety', 4),
('Women Harassment', '👩', 'special', 'Report harassment against women', 'women-harassment', 5),
('Domestic Violence', '🏠', 'special', 'Report domestic violence', 'domestic-violence', 6),
('Workplace Harassment', '💼', 'special', 'Report workplace harassment of women', 'workplace-harassment', 7),
('Women Safety', '🚺', 'special', 'Report women safety concerns', 'women-safety', 8),
('Disability Discrimination', '♿', 'special', 'Report discrimination against disabled persons', 'disability-discrimination', 9),
('Accessibility Issues', '🚧', 'special', 'Report accessibility barriers', 'accessibility', 10),
('Disabled Rights Violation', '⚖️', 'special', 'Report violation of disabled persons rights', 'disabled-rights', 11),
('Special Needs Support', '🤝', 'special', 'Report lack of special needs support', 'special-needs', 12);

-- Create site_content table for dynamic content management
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Everyone can view active content
CREATE POLICY "Anyone can view active content"
ON public.site_content FOR SELECT
USING (is_active = true);

-- Admins can manage content
CREATE POLICY "Admins can manage content"
ON public.site_content FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site content
INSERT INTO public.site_content (section_key, title, subtitle, content, metadata) VALUES
('hero', 'Report. Track. Resolve.', 'Your Voice Matters', 'CivicGuard empowers citizens to report civic issues and sensitive complaints. Our AI-powered platform ensures every voice is heard and every issue is addressed.', '{"cta_primary": "Report Issue", "cta_secondary": "Track Complaint"}'),
('categories', 'What Can You Report?', 'COMPLAINT CATEGORIES', 'From everyday civic issues to sensitive whistleblower complaints - we''ve got you covered', '{}'),
('workflow', 'How It Works', 'SIMPLE PROCESS', 'Report, track, and resolve issues in just a few simple steps', '{}'),
('stats', 'Platform Statistics', 'TRUSTED BY THOUSANDS', 'Real-time statistics showing our impact', '{}');