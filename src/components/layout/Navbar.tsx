import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Leaf, Menu, X, Package, Search, Plus, ClipboardList, Settings, LogOut, Shield, Home, MessageSquare, User, Volume2, VolumeX, Globe, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { language, setLanguage, t, speak, stopSpeech, isSpeaking, voiceEnabled, toggleVoiceMode } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navLinks = [
    { to: '/', label: t('home'), icon: Home },
    { to: '/browse', label: t('browse'), icon: Search },
    { to: '/faq-feedback', label: 'FAQs & Feedback', icon: HelpCircle },
    { to: '/my-items', label: t('myItems'), icon: Package, protected: true },
    { to: '/add-item', label: t('listItem'), icon: Plus, protected: true },
    { to: '/requests', label: t('requests'), icon: ClipboardList, protected: true },
    { to: '/messages', label: t('messages'), icon: MessageSquare, protected: true },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl group">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Leaf className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="eco-gradient-text tracking-tight font-extrabold text-2xl">EcoHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map(link => {
              if (link.protected && !user) return null;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Action Menu (Theme Toggle + Language + Voice Speech + User Menu) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-muted/60 border rounded-lg p-0.5 text-xs">
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs rounded-md"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'hi' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs rounded-md"
                onClick={() => setLanguage('hi')}
              >
                हिन्दी
              </Button>
            </div>

            {/* Text-to-Speech Voice ON/OFF Toggle Button */}
            <Button
              data-voice-control="true"
              variant={voiceEnabled ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 gap-1.5 px-2.5 text-xs font-bold border transition-all",
                voiceEnabled ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" : "text-muted-foreground",
                isSpeaking && "ring-2 ring-emerald-400 animate-pulse"
              )}
              onClick={toggleVoiceMode}
              title={voiceEnabled ? "Voice Reader Active - Click any text on page to hear" : "Click to Turn ON Voice Reader"}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-white animate-bounce" />
                  <span className="hidden sm:inline">Voice ON 🔊</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">Voice OFF 🔇</span>
                </>
              )}
            </Button>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-2 shadow-lg">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{profile?.full_name || 'Community Member'}</p>
                      <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-primary" />
                    My Profile & Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-items')} className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4 text-emerald-500" />
                    My Listed Items
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer text-amber-600 dark:text-amber-400">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')} size="sm" className="gap-1.5 shadow-sm">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 px-2 space-y-1 animate-in slide-in-from-top duration-200">
            {navLinks.map(link => {
              if (link.protected && !user) return null;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Profile Settings
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-muted"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
