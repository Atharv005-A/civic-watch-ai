import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, Shield, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user, profile, displayName, avatarUrl, role } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Your Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account information
              </p>
            </div>

            <Card variant="glass">
              <CardHeader className="text-center pb-2">
                <div className="relative mx-auto">
                  <Avatar className="w-24 h-24 border-4 border-accent/20">
                    <AvatarImage src={avatarUrl || ''} />
                    <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="mt-4">{displayName || 'User'}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  {role || 'citizen'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input 
                    id="name" 
                    value={displayName || ''} 
                    disabled 
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    value={profile?.email || user?.email || ''} 
                    disabled 
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input 
                    id="phone" 
                    value={profile?.phone || 'Not provided'} 
                    disabled 
                    className="bg-muted"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Profile editing coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
