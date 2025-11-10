import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, Upload, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { computeProfileCompletion } from "@/lib/profileCompletion";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userType: "creator" | "brand";
  userId: string;
}

const niches = [
  "Fashion", "Beauty", "Fitness", "Food", "Travel", 
  "Technology", "Gaming", "Lifestyle", "Health", "Entertainment"
];

const goals = {
  creator: [
    "Find brand partnerships",
    "Grow my audience",
    "Monetize my content",
    "Build my portfolio"
  ],
  brand: [
    "Find influencers for campaigns",
    "Increase brand awareness",
    "Launch new products",
    "Build brand partnerships"
  ]
};

export function OnboardingModal({ isOpen, onComplete, userType, userId }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentProfile();
  }, []);

  const fetchCurrentProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      const completion = computeProfileCompletion(data);
      setCompletionPercentage(completion.percentage);
    }
  };

  const updateProfile = async (updates: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId);

      if (error) throw error;

      // Fetch updated profile to recalculate completion
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        const completion = computeProfileCompletion(data);
        setCompletionPercentage(completion.percentage);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNicheToggle = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
  };

  const handleStep1Complete = async () => {
    if (selectedNiches.length < 2) {
      toast({
        title: "Select at least 2 niches",
        description: "This helps us find better matches for you.",
        variant: "destructive",
      });
      return;
    }

    await updateProfile({ niche: selectedNiches.join(",") });
    setStep(2);
  };

  const handleStep2Complete = async () => {
    await updateProfile({ avatar_url: avatarUrl });
    setStep(3);
  };

  const handleStep3Complete = async () => {
    if (!selectedGoal) {
      toast({
        title: "Select a goal",
        description: "This helps us personalize your experience.",
        variant: "destructive",
      });
      return;
    }

    await updateProfile({ 
      goal: selectedGoal,
      profile_completed: true 
    });

    toast({
      title: "Welcome aboard! 🎉",
      description: "Your profile is set up and ready to match!",
    });

    onComplete();
  };

  const handleSkip = async () => {
    await updateProfile({ profile_completed: true });
    toast({
      title: "Setup skipped",
      description: "You can complete your profile anytime from the dashboard.",
    });
    onComplete();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-xl border-2 border-primary/20 backdrop-blur-sm bg-card/95"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="space-y-6 py-4">
          {/* Progress Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <Badge variant="secondary" className="text-sm">
                {completionPercentage}% Complete
              </Badge>
            </div>
            
            <Progress value={completionPercentage} className="h-2" />
            
            {/* Progress Dots */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? "bg-primary w-8"
                      : i < step
                      ? "bg-primary/60"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={step}>
            <motion.div
              key={step}
              custom={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="text-xl font-semibold">Choose Your Niches</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select at least 2 areas you're interested in (helps us find better matches)
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {niches.map((niche) => (
                      <Button
                        key={niche}
                        type="button"
                        variant={selectedNiches.includes(niche) ? "default" : "outline"}
                        onClick={() => handleNicheToggle(niche)}
                        className="h-auto py-3 justify-start relative transition-all duration-200"
                      >
                        {selectedNiches.includes(niche) && (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        {niche}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleStep1Complete}
                      className="flex-1"
                      disabled={loading || selectedNiches.length < 2}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={loading}
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Upload className="h-5 w-5" />
                    <h3 className="text-xl font-semibold">
                      Add Your {userType === "creator" ? "Profile Photo" : "Brand Logo"}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userType === "creator" 
                      ? "Upload a photo that represents you professionally"
                      : "Upload your brand logo or representative image"}
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    {avatarUrl && (
                      <div className="flex justify-center">
                        <img
                          src={avatarUrl}
                          alt="Preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Image URL</Label>
                      <Input
                        id="avatar"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="h-12"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste a URL to your image (from Instagram, LinkedIn, etc.)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleStep2Complete}
                      className="flex-1"
                      disabled={loading}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={loading}
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Target className="h-5 w-5" />
                    <h3 className="text-xl font-semibold">Set Your First Goal</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    What brings you to CloutCash? This helps us personalize your experience.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    {goals[userType].map((goal) => (
                      <Button
                        key={goal}
                        type="button"
                        variant={selectedGoal === goal ? "default" : "outline"}
                        onClick={() => setSelectedGoal(goal)}
                        className="w-full h-auto py-4 justify-start text-left"
                      >
                        {selectedGoal === goal && (
                          <Check className="h-4 w-4 mr-2 shrink-0" />
                        )}
                        {goal}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleStep3Complete}
                      className="flex-1"
                      disabled={loading || !selectedGoal}
                    >
                      Complete Setup
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={loading}
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
