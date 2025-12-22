import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { toast } from "@/hooks/use-toast";
import { LogOut, LayoutDashboard, Compass, MessageSquare, Briefcase, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import logo from "@/assets/cloutcash-logo.png";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Navbar: React.FC = () => {
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

  const publicNavItems = [
    { label: "Home", path: "/" },
    { label: "Creators", path: "/creators" },
    { label: "Brands", path: "/brands" },
    { label: "How It Works", path: "/how-it-works" },
  ];

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
            <span className="font-bold text-xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">CloutCash</span>
          </Link>

          {/* Public Nav Links */}
          {!user && (
            <div className="hidden lg:flex items-center space-x-6">
              {publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === item.path ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
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
                  variant={location.pathname === "/campaigns" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/campaigns")}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Campaigns
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
              <>
                {/* Desktop buttons */}
                <div className="hidden lg:flex items-center space-x-4">
                  <button 
                    onClick={() => navigate("/login")}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </button>
                  <Button 
                    size="sm"
                    onClick={() => navigate("/login?mode=signup")}
                  >
                    Join Free
                  </Button>
                </div>
                
                {/* Mobile: Join Free button always visible + hamburger */}
                <div className="flex lg:hidden items-center space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => navigate("/login?mode=signup")}
                  >
                    Join Free
                  </Button>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72 bg-background">
                      <nav className="flex flex-col gap-4 mt-8">
                        {publicNavItems.map((item, index) => (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
                          >
                            <SheetClose asChild>
                              <Link
                                to={item.path}
                                className={`text-lg font-medium transition-colors hover:text-primary py-2 block ${
                                  location.pathname === item.path ? "text-primary" : ""
                                }`}
                              >
                                {item.label}
                              </Link>
                            </SheetClose>
                          </motion.div>
                        ))}
                        
                        <motion.div 
                          className="border-t border-border my-2"
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
                        >
                          <SheetClose asChild>
                            <button 
                              onClick={() => navigate("/login")}
                              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2 block w-full text-left"
                            >
                              Login
                            </button>
                          </SheetClose>
                        </motion.div>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
