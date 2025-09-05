import { Heart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Heart className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">MediReach</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex-col items-start">
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
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;