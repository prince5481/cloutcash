import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Users, TrendingUp, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MatchCard } from "./dashboard/MatchCard";
import { AnalyticsDashboard } from "./dashboard/AnalyticsDashboard";
import { ChatModal } from "./dashboard/ChatModal";
import { PremiumCard } from "./dashboard/PremiumCard";
import { NotificationBell } from "./dashboard/NotificationBell";
import { ProfileChecklistModal } from "./dashboard/ProfileChecklistModal";
import { RecommendedMatches } from "./dashboard/RecommendedMatches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeProfileCompletion } from "@/lib/profileCompletion";

interface Profile {
  id: string;
  full_name: string;
  user_type: string;
  handle?: string;
  follower_count?: number;
  marketing_budget?: number;
  niche?: string;
  profile_completed: boolean;
  engagement_rate?: number;
  location?: string;
}

interface Match {
  id: string;
  match_score: number;
  status: string;
  brand?: Profile;
  creator?: Profile;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface SavedMatch {
  id: string;
  saved_profile_id: string;
}

interface CollabRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  message: string;
  created_at: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Profile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
  const [collabRequests, setCollabRequests] = useState<CollabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState("");
  const [checklistOpen, setChecklistOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileAndMatches();
    }
  }, [user]);

  const fetchProfileAndMatches = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch all potential matches using smart algorithm
      await fetchSmartMatches(profileData);

      // Fetch existing matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          *,
          creator:profiles!matches_creator_id_fkey(*),
          brand:profiles!matches_brand_id_fkey(*)
        `)
        .or(`creator_id.eq.${profileData.id},brand_id.eq.${profileData.id}`)
        .order("match_score", { ascending: false })
        .limit(5);

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

      // Fetch saved matches
      const { data: savedData } = await supabase
        .from("saved_matches")
        .select("*")
        .eq("user_id", profileData.id);
      setSavedMatches(savedData || []);

      // Fetch notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications(notifData || []);

      // Fetch collab requests
      const { data: requestsData } = await supabase
        .from("collaboration_requests")
        .select("*")
        .or(`sender_id.eq.${profileData.id},receiver_id.eq.${profileData.id}`)
        .order("created_at", { ascending: false });
      setCollabRequests(requestsData || []);

      // Show toast if profile completion is low
      const completion = computeProfileCompletion(profileData);
      if (completion.percentage < 70) {
        setTimeout(() => {
          toast({
            title: "Complete Your Profile",
            description: "Reach 70%+ completion for better matches.",
            duration: 5000,
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartMatches = async (userProfile: Profile) => {
    try {
      const isCreator = userProfile.user_type === "creator";
      const targetType = isCreator ? "brand" : "creator";

      const { data: potentialMatches, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", targetType)
        .neq("id", userProfile.id);

      if (error) throw error;

      // Smart matching algorithm
      const scoredMatches = potentialMatches.map((match) => {
        let score = 0;

        // Category match (40 points)
        if (match.niche === userProfile.niche) score += 40;
        else if (match.niche) score += 10;

        // Location match (30 points)
        if (match.location === userProfile.location) score += 30;
        else if (match.location) score += 10;

        // Budget/Engagement fit (30 points)
        if (isCreator) {
          const budget = match.marketing_budget || 0;
          const followers = userProfile.follower_count || 0;
          if (followers > 0) {
            const budgetPerFollower = budget / followers;
            if (budgetPerFollower > 0.01) score += 30;
            else if (budgetPerFollower > 0.005) score += 20;
            else score += 10;
          }
        } else {
          const engagement = match.engagement_rate || 0;
          if (engagement > 5) score += 30;
          else if (engagement > 2) score += 20;
          else if (engagement > 0) score += 10;
        }

        return { ...match, calculatedScore: Math.min(score, 100) };
      });

      // Sort by score and take top matches
      const topMatches = scoredMatches
        .sort((a, b) => b.calculatedScore - a.calculatedScore)
        .slice(0, 20);

      setAllMatches(topMatches);
    } catch (error) {
      console.error("Error fetching smart matches:", error);
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    if (!profile) return;
    
    try {
      const { error } = await supabase.from("collaboration_requests").insert({
        sender_id: profile.id,
        receiver_id: receiverId,
        message: "I'd love to collaborate with you!",
      });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: "Your collaboration request has been sent.",
      });

      // Create notification for receiver
      await supabase.from("notifications").insert({
        user_id: receiverId,
        type: "collab_request",
        title: "New Collaboration Request",
        message: `${profile.full_name} sent you a collaboration request`,
      });
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive",
      });
    }
  };

  const handleSaveMatch = async (profileId: string) => {
    if (!profile) return;

    const isSaved = savedMatches.some((s) => s.saved_profile_id === profileId);

    try {
      if (isSaved) {
        const saved = savedMatches.find((s) => s.saved_profile_id === profileId);
        if (saved) {
          await supabase.from("saved_matches").delete().eq("id", saved.id);
          setSavedMatches(savedMatches.filter((s) => s.id !== saved.id));
          toast({ title: "Removed from saved" });
        }
      } else {
        const { data, error } = await supabase
          .from("saved_matches")
          .insert({ user_id: profile.id, saved_profile_id: profileId })
          .select()
          .single();

        if (error) throw error;
        setSavedMatches([...savedMatches, data]);
        toast({ title: "Saved successfully!" });
      }
    } catch (error) {
      console.error("Error saving match:", error);
      toast({
        title: "Error",
        description: "Failed to save match",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completionData = profile ? computeProfileCompletion(profile) : { percentage: 0, checklist: [] };
  const profileCompletion = completionData.percentage;
  const isCreator = profile?.user_type === "creator";

  const analytics = {
    reach: 125000,
    engagementRate: profile?.engagement_rate || 4.8,
    acceptedOffers: 12,
    campaignROI: 285,
    savedInfluencers: savedMatches.length,
    totalSpend: 45000,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name}!
            </h1>
            <p className="text-muted-foreground">
              Your {isCreator ? "creator" : "brand"} dashboard
            </p>
          </div>
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>

        {/* Profile Completion Card */}
        <Card className="mb-8 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Profile Completion
            </CardTitle>
            <CardDescription>
              {profileCompletion === 100
                ? "Your profile is complete! You're getting maximum matches."
                : "Complete your profile to get better matches"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={profileCompletion} className="h-3" />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {profileCompletion}% complete
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChecklistOpen(true)}
                >
                  View Checklist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Matches Section */}
        <RecommendedMatches userType={isCreator ? "creator" : "brand"} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{matches.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Match Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">
                  {matches.length > 0
                    ? Math.round(
                        matches.reduce((acc, m) => acc + m.match_score, 0) / matches.length
                      )
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-3xl font-bold">
                  {matches.filter((m) => m.status === "pending").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({collabRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Top Matches</h2>
                <p className="text-muted-foreground">
                  {isCreator
                    ? "Brands that match your profile and audience"
                    : "Creators that match your brand and campaign goals"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => profile && fetchSmartMatches(profile)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Find More Matches
              </Button>
            </div>

            {allMatches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No matches yet. Complete your profile to get matched!
                  </p>
                  <Button>Complete Profile</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {allMatches.slice(0, 5).map((match: any) => (
                  <MatchCard
                    key={match.id}
                    matchProfile={match}
                    matchScore={match.calculatedScore}
                    onSendRequest={() => handleSendRequest(match.id)}
                    onSave={() => handleSaveMatch(match.id)}
                    onChat={() => {
                      setChatRecipient(match.full_name);
                      setChatOpen(true);
                    }}
                    isSaved={savedMatches.some(
                      (s) => s.saved_profile_id === match.id
                    )}
                    isCreator={isCreator}
                  />
                ))}
              </div>
            )}

            <PremiumCard />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard isCreator={isCreator} stats={analytics} />
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Requests</CardTitle>
                <CardDescription>
                  Manage your incoming and outgoing collaboration requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collabRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No collaboration requests yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {collabRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {request.sender_id === profile?.id
                              ? "Sent"
                              : "Received"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              request.status === "accepted"
                                ? "bg-green-500/20 text-green-500"
                                : request.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>

      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipientName={chatRecipient}
      />
      
      <ProfileChecklistModal
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
        completionData={completionData}
        userType={isCreator ? "creator" : "brand"}
      />
    </div>
  );
};
