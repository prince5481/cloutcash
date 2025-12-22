import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const step = searchParams.get("step");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    location: "",
    handle: "",
    niche: "",
    follower_count: 0,
    engagement_rate: 0,
    bio: "",
    avatar_url: "",
    website: "",
    marketing_budget: 0,
    goal: "",
    user_type: "creator",
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Refs for scrolling
  const emailRef = useRef<HTMLDivElement>(null);
  const nameCityRef = useRef<HTMLDivElement>(null);
  const nichesRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const followersRef = useRef<HTMLDivElement>(null);
  const engagementRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);
  const goalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!loading && step) {
      scrollToStep(step);
    }
  }, [loading, step]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          location: data.location || "",
          handle: data.handle || "",
          niche: data.niche || "",
          follower_count: data.follower_count || 0,
          engagement_rate: data.engagement_rate || 0,
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          website: data.website || "",
          marketing_budget: data.marketing_budget || 0,
          goal: data.goal || "",
          user_type: data.user_type || "creator",
        });

        const completion = computeProfileCompletion({
          ...data,
          email: user.email,
        });
        setCompletionPercentage(completion.percentage);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToStep = (stepName: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      email: emailRef,
      "name-city": nameCityRef,
      niches: nichesRef,
      handle: handleRef,
      followers: followersRef,
      engagement: engagementRef,
      media: mediaRef,
      bio: bioRef,
      avatar: avatarRef,
      budget: budgetRef,
      goal: goalRef,
    };

    const targetRef = refs[stepName];
    if (targetRef?.current) {
      setTimeout(() => {
        targetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        targetRef.current?.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          targetRef.current?.classList.remove("ring-2", "ring-primary", "ring-offset-2");
        }, 2000);
      }, 100);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!existingProfile) {
        toast({
          title: "Error",
          description: "Profile not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          location: profileData.location,
          handle: profileData.handle,
          niche: profileData.niche,
          follower_count: profileData.follower_count,
          engagement_rate: profileData.engagement_rate,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          website: profileData.website,
          marketing_budget: profileData.marketing_budget,
          goal: profileData.goal,
        })
        .eq("id", existingProfile.id);

      if (error) throw error;

      // Recalculate completion
      const completion = computeProfileCompletion({
        ...profileData,
        email: user.email,
      });
      setCompletionPercentage(completion.percentage);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Animate progress bar
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  const isCreator = profileData.user_type === "creator";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 pb-32">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground mb-4">
              Fill in all sections to unlock better matches and opportunities
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-bold text-primary">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>

          {/* Email (read-only) */}
          <Card ref={emailRef} className="mb-6 transition-all duration-300">
            <CardHeader>
              <CardTitle>Email Verified</CardTitle>
              <CardDescription>Your verified email address</CardDescription>
            </CardHeader>
            <CardContent>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </CardContent>
          </Card>

          {/* Name and City */}
          <Card ref={nameCityRef} className="mb-6 transition-all duration-300">
            <CardHeader>
              <CardTitle>Name and {isCreator ? "City" : "Website"}</CardTitle>
              <CardDescription>Basic information about you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>
              {isCreator ? (
                <div>
                  <Label htmlFor="location">City</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({ ...profileData, location: e.target.value })
                    }
                    placeholder="Enter your city"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData({ ...profileData, website: e.target.value })
                    }
                    placeholder="https://yourcompany.com"
                  />
                </div>
              )}
              {!isCreator && (
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({ ...profileData, location: e.target.value })
                    }
                    placeholder="Enter your location"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Niches */}
          <Card ref={nichesRef} className="mb-6 transition-all duration-300">
            <CardHeader>
              <CardTitle>{isCreator ? "At least 2 niches" : "Sector and niches"}</CardTitle>
              <CardDescription>
                Enter niches separated by commas (e.g., Fashion, Beauty, Travel)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={profileData.niche}
                onChange={(e) => setProfileData({ ...profileData, niche: e.target.value })}
                placeholder="Fashion, Beauty, Travel"
              />
            </CardContent>
          </Card>

          {/* Social Handle (creators only) */}
          {isCreator && (
            <Card ref={handleRef} className="mb-6 transition-all duration-300">
              <CardHeader>
                <CardTitle>Social Handle</CardTitle>
                <CardDescription>Your primary social media handle</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={profileData.handle}
                  onChange={(e) =>
                    setProfileData({ ...profileData, handle: e.target.value })
                  }
                  placeholder="@yourusername"
                />
              </CardContent>
            </Card>
          )}

          {/* Budget (brands only) */}
          {!isCreator && (
            <Card ref={budgetRef} className="mb-6 transition-all duration-300">
              <CardHeader>
                <CardTitle>Monthly Marketing Budget</CardTitle>
                <CardDescription>Your budget for influencer collaborations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Slider
                    value={[profileData.marketing_budget]}
                    onValueChange={([value]) =>
                      setProfileData({ ...profileData, marketing_budget: value })
                    }
                    min={0}
                    max={100000}
                    step={1000}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-24 text-right">
                    ${profileData.marketing_budget.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follower Bracket */}
          <Card ref={followersRef} className="mb-6 transition-all duration-300">
            <CardHeader>
              <CardTitle>
                {isCreator ? "Follower Bracket" : "Target Follower Brackets"}
              </CardTitle>
              <CardDescription>
                {isCreator ? "Your follower count" : "Target influencer follower count"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Slider
                  value={[profileData.follower_count]}
                  onValueChange={([value]) =>
                    setProfileData({ ...profileData, follower_count: value })
                  }
                  min={0}
                  max={1000000}
                  step={1000}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-24 text-right">
                  {profileData.follower_count.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Rate (creators only) */}
          {isCreator && (
            <Card ref={engagementRef} className="mb-6 transition-all duration-300">
              <CardHeader>
                <CardTitle>Engagement Rate</CardTitle>
                <CardDescription>Your average engagement rate (%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Slider
                    value={[profileData.engagement_rate]}
                    onValueChange={([value]) =>
                      setProfileData({ ...profileData, engagement_rate: value })
                    }
                    min={0}
                    max={20}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16 text-right">
                    {profileData.engagement_rate.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign Goal (brands only) */}
          {!isCreator && (
            <Card ref={goalRef} className="mb-6 transition-all duration-300">
              <CardHeader>
                <CardTitle>Campaign Objective</CardTitle>
                <CardDescription>What's your primary goal?</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={profileData.goal}
                  onChange={(e) => setProfileData({ ...profileData, goal: e.target.value })}
                  placeholder="Brand awareness, Product launch, etc."
                />
              </CardContent>
            </Card>
          )}

          {/* Media Sample */}
          <Card ref={mediaRef} className="mb-6 transition-all duration-300">
            <CardHeader>
              <CardTitle>{isCreator ? "At least 1 media sample" : "At least 1 creative"}</CardTitle>
              <CardDescription>Add a portfolio link or media URL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/portfolio"
                  value={profileData.avatar_url}
                  onChange={(e) =>
                    setProfileData({ ...profileData, avatar_url: e.target.value })
                  }
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Add a link to your portfolio, Instagram, or upload media
              </p>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card ref={bioRef} className="mb-6 transition-all duration-300">
            <CardHeader>
              <CardTitle>
                {isCreator ? "Bio (120+ characters)" : "Brief (60+ characters)"}
              </CardTitle>
              <CardDescription>
                Tell us about yourself
                {profileData.bio && (
                  <span className="ml-2 text-primary font-medium">
                    ({profileData.bio.length} characters)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder={
                  isCreator
                    ? "Describe your content, audience, and what makes you unique..."
                    : "Describe your brand, target audience, and campaign goals..."
                }
                rows={5}
                className={
                  profileData.bio.length >= (isCreator ? 120 : 60)
                    ? "border-primary"
                    : ""
                }
              />
              <p className="text-xs text-muted-foreground mt-2">
                Minimum {isCreator ? "120" : "60"} characters required
              </p>
            </CardContent>
          </Card>

          {/* Profile Avatar */}
          <Card ref={avatarRef} className="mb-6 transition-all duration-300">
            <CardHeader>
              <CardTitle>Profile Avatar</CardTitle>
              <CardDescription>Upload or link to your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  value={profileData.avatar_url}
                  onChange={(e) =>
                    setProfileData({ ...profileData, avatar_url: e.target.value })
                  }
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
