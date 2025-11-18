import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Users, TrendingUp, Crown } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  // Mock profile data
  const profile = {
    name: user?.user_metadata?.full_name || 'Brand Manager',
    email: user?.email || 'user@example.com',
    role: 'Brand',
    company: 'GlowVerve Beauty',
    location: 'Mumbai',
    plan: 'Basic',
    stats: {
      matches: 12,
      activeDeals: 3,
      completedCampaigns: 0
    }
  };

  return (
    <>
      <Navbar 
        onHomeClick={() => {}}
        onContactClick={() => {}}
        onAboutClick={() => {}}
      />
      <div className="min-h-screen bg-background pt-20 pb-32">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={`https://picsum.photos/seed/user${user?.id}/200/200`} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <Badge variant="outline">{profile.role}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{profile.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                    {profile.company && (
                      <span>{profile.company}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Plan Badge */}
              <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Basic Plan</p>
                    <p className="text-xs text-muted-foreground">Limited features active</p>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Crown className="w-4 h-4" />
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{profile.stats.matches}</p>
                <p className="text-xs text-muted-foreground">Matches</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{profile.stats.activeDeals}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Badge className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-base">
                  ✓
                </Badge>
                <p className="text-2xl font-bold">{profile.stats.completedCampaigns}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Preferences</h4>
                <p className="text-sm text-muted-foreground">
                  Customize your matching preferences and notifications
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Edit Preferences
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  Manage your privacy settings and data
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
