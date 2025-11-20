import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { toast } from "@/hooks/use-toast";
import { LogOut, LayoutDashboard, Compass, MessageSquare } from "lucide-react";
import logo from "@/assets/cloutcash-logo.png";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavbarProps {
  onHomeClick: () => void;
  onContactClick: () => void;
  onAboutClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onHomeClick, onContactClick, onAboutClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Fetch current user's profile ID
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setCurrentProfileId(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.id) {
        setCurrentProfileId(data.id);
      }
    };
    fetchProfile();
  }, [user]);

  // Use unread count hook
  const { totalUnread } = useUnreadCount(currentProfileId);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <img src={logo} alt="CloutCash" className="h-8" />
            <span className="font-bold text-xl">CloutCash</span>
          </Link>

          {/* Nav Links */}
          {!user && (
            <div className="hidden md:flex items-center space-x-6">
              <span
                onClick={onHomeClick}
                className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
              >
                Home
              </span>
              <span
                onClick={onAboutClick}
                className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
              >
                About
              </span>
              <span
                onClick={onContactClick}
                className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
              >
                Contact
              </span>
            </div>
          )}

          {/* Right-side controls */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant={location.pathname === "/dashboard" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={location.pathname === "/discover" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/discover")}
                >
                  <Compass className="h-4 w-4 mr-2" />
                  Discover
                </Button>
                <Button
                  variant={location.pathname === "/messages" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/messages")}
                  className="relative"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                  {totalUnread > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 text-xs"
                    >
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="group"
                >
                  <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate("/login")} size="sm">
                Join Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
