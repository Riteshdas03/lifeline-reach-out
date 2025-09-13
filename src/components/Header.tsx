import { Heart, User, LogOut, Menu, X, MapPin, Phone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Find Hospitals', href: '/find-hospitals', icon: MapPin },
    { name: 'Emergency Services', href: '/emergency-services', icon: Phone },
    { name: 'Health Camps', href: '/health-camps', icon: Users },
    { name: 'Register Hospital', href: '/register-hospital', icon: Heart },
    { name: 'Become Donor', href: '/become-donor', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-primary to-primary-glow p-2 rounded-lg shadow-lg">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediReach</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border shadow-lg" align="end" forceMount>
                  <DropdownMenuItem className="flex-col items-start p-3">
                    <div className="font-medium">{user.user_metadata?.full_name || 'User'}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/sign-in">
                <Button variant="outline" size="sm" className="bg-background">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-card">
                <div className="flex flex-col h-full">
                  {/* Mobile header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-primary to-primary-glow p-2 rounded-lg shadow-lg">
                        <Heart className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="text-lg font-bold text-foreground">MediReach</span>
                    </div>
                  </div>

                  {/* Mobile navigation */}
                  <nav className="flex-1 px-4 py-6">
                    <div className="space-y-1">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center gap-3 text-foreground hover:bg-muted px-3 py-3 rounded-lg text-base font-medium transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5 text-primary" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </nav>

                  {/* Mobile auth */}
                  <div className="border-t p-4">
                    {user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">
                              {user.user_metadata?.full_name || 'User'}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={handleSignOut} 
                          variant="outline" 
                          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <User className="mr-2 h-4 w-4" />
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;