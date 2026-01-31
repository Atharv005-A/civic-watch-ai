import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Menu, 
  X, 
  FileText, 
  LayoutDashboard, 
  MapPin, 
  Bell,
  User,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { name: 'Home', path: '/', icon: Shield },
  { name: 'Report Issue', path: '/report', icon: FileText },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Heatmap', path: '/heatmap', icon: MapPin },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, displayName, avatarUrl, role, signOut, isAdmin, isAuthority } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleBadgeVariant = () => {
    if (isAdmin) return 'destructive';
    if (isAuthority) return 'info';
    return 'secondary';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg group-hover:shadow-glow transition-shadow">
                <Shield className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg text-foreground">CivicGuard</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Smart Civic Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={`gap-2 ${isActive ? 'bg-accent/10 text-accent' : ''}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
            
            {/* Admin Link */}
            {(isAdmin || isAuthority) && (
              <Link to="/admin">
                <Button
                  variant={location.pathname === '/admin' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`gap-2 ${location.pathname === '/admin' ? 'bg-accent/10 text-accent' : ''}`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user && (
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{displayName || 'User'}</p>
                      <Badge variant={getRoleBadgeVariant()} className="text-[10px] px-1.5 py-0">
                        {role}
                      </Badge>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{displayName || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Complaints
                  </DropdownMenuItem>
                  {(isAdmin || isAuthority) && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="accent" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border"
          >
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-3 ${isActive ? 'bg-accent/10 text-accent' : ''}`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              {(isAdmin || isAuthority) && (
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Settings className="w-5 h-5" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              {!user && (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="accent" className="w-full gap-2 mt-4">
                    <LogIn className="w-4 h-4" />
                    Login / Sign Up
                  </Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
