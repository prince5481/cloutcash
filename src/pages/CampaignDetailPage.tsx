import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  Edit,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Campaign {
  id: string;
  title: string;
  budget: number;
  deliverables: string;
  start_date: string;
  end_date: string;
  status: string;
  brand_id: string;
  creator_id: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  handle: string | null;
  avatar_url: string | null;
  user_type: string;
  user_id: string;
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [brandProfile, setBrandProfile] = useState<Profile | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchCampaignDetails();
    }
  }, [id, user]);

  const fetchCampaignDetails = async () => {
    try {
      // Fetch current user profile
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profileError) throw profileError;
      setCurrentUserProfile(userProfile);

      // Fetch campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (campaignError) throw campaignError;
      setCampaign(campaignData);

      // Fetch brand profile
      const { data: brand, error: brandError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", campaignData.brand_id)
        .single();

      if (brandError) throw brandError;
      setBrandProfile(brand);

      // Fetch creator profile if assigned
      if (campaignData.creator_id) {
        const { data: creator, error: creatorError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", campaignData.creator_id)
          .single();

        if (creatorError) throw creatorError;
        setCreatorProfile(creator);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      });
      navigate("/campaigns");
    }
  };

  const handleAccept = async () => {
    if (!campaign || !currentUserProfile) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ 
          status: "accepted",
          creator_id: currentUserProfile.id 
        })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign Accepted!",
        description: "You've successfully accepted this campaign offer.",
      });
      
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error accepting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to accept campaign",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!campaign) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "rejected" })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign Rejected",
        description: "You've rejected this campaign offer.",
      });
      
      navigate("/campaigns");
    } catch (error) {
      console.error("Error rejecting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to reject campaign",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!campaign) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "completed" })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign Completed!",
        description: "Campaign has been marked as completed.",
      });
      
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error completing campaign:", error);
      toast({
        title: "Error",
        description: "Failed to mark campaign as completed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageShortcut = () => {
    navigate("/messages");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      proposed: { label: "Proposed", variant: "secondary" },
      accepted: { label: "Accepted", variant: "default" },
      active: { label: "Active", variant: "default" },
      completed: { label: "Completed", variant: "outline" },
      rejected: { label: "Rejected", variant: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.proposed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!campaign || !brandProfile || !currentUserProfile) {
    return null;
  }

  const isCreator = currentUserProfile.user_type === "creator";
  const isBrand = currentUserProfile.user_type === "brand";
  const isAssignedCreator = campaign.creator_id === currentUserProfile.id;

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="container max-w-4xl mx-auto px-4 space-y-6">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/campaigns")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
              {getStatusBadge(campaign.status)}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Budget & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-lg font-semibold">₹{campaign.budget.toLocaleString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="text-sm">
                        {format(new Date(campaign.start_date), "PPP")} - {format(new Date(campaign.end_date), "PPP")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deliverables */}
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{campaign.deliverables}</p>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    {isCreator && campaign.status === "proposed" && (
                      <>
                        <Button 
                          onClick={handleAccept}
                          disabled={actionLoading}
                          className="gap-2"
                        >
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Accept Offer
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={handleReject}
                          disabled={actionLoading}
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    )}

                    {isBrand && campaign.status === "accepted" && (
                      <Button 
                        onClick={handleMarkCompleted}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Mark as Completed
                      </Button>
                    )}

                    {isBrand && (
                      <Button 
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Campaign
                      </Button>
                    )}

                    <Button 
                      variant="outline"
                      onClick={handleMessageShortcut}
                      className="gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Brand info */}
              <Card>
                <CardHeader>
                  <CardTitle>Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={brandProfile.avatar_url || ""} />
                      <AvatarFallback>{brandProfile.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{brandProfile.full_name}</p>
                      {brandProfile.handle && (
                        <p className="text-sm text-muted-foreground">@{brandProfile.handle}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Creator info */}
              {creatorProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Creator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={creatorProfile.avatar_url || ""} />
                        <AvatarFallback>{creatorProfile.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{creatorProfile.full_name}</p>
                        {creatorProfile.handle && (
                          <p className="text-sm text-muted-foreground">@{creatorProfile.handle}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
