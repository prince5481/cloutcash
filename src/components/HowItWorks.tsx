import { UserPlus, Search, Handshake, TrendingUp, Check } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  outcome: string;
  microCopy: string[];
}

// Hover Preview Tabs Component
interface HoverPreviewTabsProps {
  influencerContent: ReactNode;
  brandContent: ReactNode;
}

const HoverPreviewTabs = ({ influencerContent, brandContent }: HoverPreviewTabsProps) => {
  const [selectedTab, setSelectedTab] = useState<"influencer" | "brand">("influencer");
  const [previewTab, setPreviewTab] = useState<"influencer" | "brand" | null>(null);
  
  const displayedTab = previewTab || selectedTab;

  const handleTabClick = (tab: "influencer" | "brand") => {
    setSelectedTab(tab);
    setPreviewTab(null);
  };

  const handleTabHover = (tab: "influencer" | "brand") => {
    if (tab !== selectedTab) {
      setPreviewTab(tab);
    }
  };

  const handleTabLeave = () => {
    setPreviewTab(null);
  };

  return (
    <div className="max-w-5xl mx-auto mb-16">
      {/* Custom Tab Toggle */}
      <div 
        className="relative flex justify-center mb-12"
        onMouseLeave={handleTabLeave}
      >
        <div className="relative inline-flex bg-muted/50 rounded-full p-1.5 backdrop-blur-sm border border-border/50">
          {/* Animated Background Pill */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-full bg-primary shadow-lg"
            initial={false}
            animate={{
              x: displayedTab === "influencer" ? 0 : "100%",
              width: "calc(50% - 3px)",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            style={{ left: "6px" }}
          />
          
          {/* Glow effect on hover/active */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-full pointer-events-none"
            initial={false}
            animate={{
              x: displayedTab === "influencer" ? 0 : "100%",
              width: "calc(50% - 3px)",
              boxShadow: previewTab 
                ? "0 0 20px hsl(var(--primary) / 0.4)" 
                : "0 0 15px hsl(var(--primary) / 0.25)",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            style={{ left: "6px" }}
          />

          {/* Influencer Tab */}
          <motion.button
            onClick={() => handleTabClick("influencer")}
            onMouseEnter={() => handleTabHover("influencer")}
            className={`
              relative z-10 px-6 py-3 text-base md:text-lg font-medium rounded-full transition-colors duration-200
              ${displayedTab === "influencer" 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
              }
            `}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2">
              For Influencers
              {selectedTab === "influencer" && !previewTab && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70"
                />
              )}
            </span>
          </motion.button>

          {/* Brand Tab */}
          <motion.button
            onClick={() => handleTabClick("brand")}
            onMouseEnter={() => handleTabHover("brand")}
            className={`
              relative z-10 px-6 py-3 text-base md:text-lg font-medium rounded-full transition-colors duration-200
              ${displayedTab === "brand" 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
              }
            `}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2">
              For Brands
              {selectedTab === "brand" && !previewTab && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70"
                />
              )}
            </span>
          </motion.button>
        </div>

        {/* Preview indicator */}
        <AnimatePresence>
          {previewTab && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground"
            >
              Preview mode
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab Content with Cross-fade */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayedTab}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {displayedTab === "influencer" ? influencerContent : brandContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Animated micro-copy component
const MicroCopyAnimator = ({ phrases, isActive }: { phrases: string[]; isActive: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [isActive, phrases.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="h-5 mt-2 flex items-center justify-center"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-xs font-medium text-primary-foreground/70 flex items-center gap-1.5"
        >
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60"
          />
          {phrases[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};

export const HowItWorks = () => {
  const [activeInfluencerStep, setActiveInfluencerStep] = useState(0);
  const [activeBrandStep, setActiveBrandStep] = useState(0);
  const [completedInfluencerSteps, setCompletedInfluencerSteps] = useState<number[]>([]);
  const [completedBrandSteps, setCompletedBrandSteps] = useState<number[]>([]);

  const influencerSteps: Step[] = [
    {
      number: "1",
      icon: UserPlus,
      title: "Create Profile",
      description: "Connect your socials and let your profile highlight what makes you unique. We surface opportunities that actually fit your style — no random campaigns.",
      outcome: "Your profile works for you, attracting the right brands automatically.",
      microCopy: ["Syncing metrics...", "Analyzing audience...", "Profile ready!"],
    },
    {
      number: "2",
      icon: Search,
      title: "Get Matched",
      description: "Matches are based on your content style, audience fit, and preferences. No mass outreach. No irrelevant deals.",
      outcome: "Only see opportunities that align with your niche and values.",
      microCopy: ["Finding matches...", "Scoring compatibility...", "3 matches found!"],
    },
    {
      number: "3",
      icon: Handshake,
      title: "Connect & Chat",
      description: "Discuss deliverables, timelines, and expectations directly with brands. Clear communication from the start means less back-and-forth later.",
      outcome: "Get aligned on details before you commit — no surprises.",
      microCopy: ["Opening chat...", "Syncing details...", "Ready to connect!"],
    },
    {
      number: "4",
      icon: TrendingUp,
      title: "Create Together",
      description: "Collaborate, deliver great content, and build relationships that lead to repeat partnerships and long-term growth.",
      outcome: "Turn one-off gigs into ongoing brand relationships.",
      microCopy: ["Tracking views...", "Processing payment...", "Earnings updated!"],
    },
  ];

  const brandSteps: Step[] = [
    {
      number: "1",
      icon: UserPlus,
      title: "Post Campaign",
      description: "Define your goals, budget, and ideal creator profile. Your brief helps us find creators who genuinely fit — not just anyone available.",
      outcome: "Start with clarity so every match is relevant from day one.",
      microCopy: ["Setting goals...", "Defining audience...", "Campaign live!"],
    },
    {
      number: "2",
      icon: Search,
      title: "Get Recommendations",
      description: "Receive AI-curated creator recommendations based on audience alignment, content quality, and past performance. No guesswork.",
      outcome: "Spend less time searching, more time evaluating quality fits.",
      microCopy: ["Scanning creators...", "Ranking by fit...", "12 creators matched!"],
    },
    {
      number: "3",
      icon: Handshake,
      title: "Review & Select",
      description: "Browse portfolios, compare metrics, and connect directly. Discuss scope, timelines, and expectations before committing.",
      outcome: "Make confident decisions with transparent creator insights.",
      microCopy: ["Loading portfolios...", "Shortlisting creators...", "Ready to hire!"],
    },
    {
      number: "4",
      icon: TrendingUp,
      title: "Launch & Track",
      description: "Manage collaborations, track real-time analytics, and build creator relationships that deliver results again and again.",
      outcome: "Turn campaigns into repeatable partnerships with proven creators.",
      microCopy: ["Launching campaign...", "Tracking ROI...", "Results are in!"],
    },
  ];

  const handleStepInteraction = (
    index: number,
    activeStep: number,
    setActiveStep: React.Dispatch<React.SetStateAction<number>>,
    completedSteps: number[],
    setCompletedSteps: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    if (index > activeStep) {
      const newCompleted = [...completedSteps];
      for (let i = activeStep; i < index; i++) {
        if (!newCompleted.includes(i)) {
          newCompleted.push(i);
        }
      }
      setCompletedSteps(newCompleted);
    }
    setActiveStep(index);
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose your journey and start matching in minutes
          </p>
        </div>

        <HoverPreviewTabs
          influencerContent={
            <ProgressiveStepFlow
              steps={influencerSteps}
              activeStep={activeInfluencerStep}
              completedSteps={completedInfluencerSteps}
              onStepInteraction={(index) =>
                handleStepInteraction(
                  index,
                  activeInfluencerStep,
                  setActiveInfluencerStep,
                  completedInfluencerSteps,
                  setCompletedInfluencerSteps
                )
              }
            />
          }
          brandContent={
            <ProgressiveStepFlow
              steps={brandSteps}
              activeStep={activeBrandStep}
              completedSteps={completedBrandSteps}
              onStepInteraction={(index) =>
                handleStepInteraction(
                  index,
                  activeBrandStep,
                  setActiveBrandStep,
                  completedBrandSteps,
                  setCompletedBrandSteps
                )
              }
            />
          }
        />

        <div className="mt-20 text-center space-y-6">
          <div className="inline-block bg-primary/10 border border-primary/20 rounded-2xl px-8 py-6">
            <p className="text-lg font-semibold text-foreground mb-2">
              Average Time to First Match
            </p>
            <p className="text-4xl font-bold text-primary">24 Hours</p>
          </div>
          
          {/* Reassurance line */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-sm max-w-md mx-auto"
          >
            Simple, transparent, and relevant collaborations — built for creators and brands who value quality over quantity.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

interface ProgressiveStepFlowProps {
  steps: Step[];
  activeStep: number;
  completedSteps: number[];
  onStepInteraction: (index: number) => void;
}

const ProgressiveStepFlow = ({
  steps,
  activeStep,
  completedSteps,
  onStepInteraction,
}: ProgressiveStepFlowProps) => {
  const progressPercentage = ((activeStep + 1) / steps.length) * 100;

  return (
    <div>
      {/* Progress Indicator */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          {steps.map((_, index) => {
            const isCompleted = completedSteps.includes(index);
            const isActive = activeStep === index;
            const isPast = index < activeStep;

            return (
              <motion.div
                key={index}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => onStepInteraction(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    backgroundColor:
                      isActive || isCompleted || isPast
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted))",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center relative"
                >
                  {isCompleted || isPast ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                        delay: 0.1,
                      }}
                    >
                      <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <span
                      className={`text-[10px] md:text-xs font-bold ${
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}

                  {/* Active pulse ring */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="relative h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
          <motion.div
            className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "400%" }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const isPast = index < activeStep || completedSteps.includes(index);
          const isFuture = index > activeStep;
          const IconComponent = step.icon;

          return (
            <motion.div
              key={step.number}
              onClick={() => onStepInteraction(index)}
              onMouseEnter={() => onStepInteraction(index)}
              initial={false}
              animate={{
                scale: isActive ? 1.03 : 1,
                y: isActive ? -6 : 0,
                opacity: isFuture ? 0.5 : 1,
              }}
              whileHover={{
                scale: 1.03,
                y: -6,
                opacity: 1,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className={`
                relative cursor-pointer rounded-2xl p-6 pb-8 text-center transition-all duration-300
                ${
                  isActive
                    ? "bg-primary shadow-xl shadow-primary/25 ring-2 ring-primary/40"
                    : isPast
                    ? "bg-primary/5 border-2 border-primary/30"
                    : "bg-card border-2 border-border hover:border-primary/40"
                }
              `}
            >
              {/* Step Number Badge */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor:
                    isActive
                      ? "hsl(var(--primary-foreground))"
                      : isPast
                      ? "hsl(var(--primary))"
                      : "hsl(var(--primary))",
                }}
                className={`
                  absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full 
                  flex items-center justify-center font-bold text-sm shadow-lg
                  ${isActive ? "text-primary" : "text-primary-foreground"}
                `}
              >
                {isPast && !isActive ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </motion.div>

              {/* Icon Container */}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  rotate: isActive ? 8 : 0,
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 mt-3 relative
                  ${
                    isActive
                      ? "bg-primary-foreground/20"
                      : isPast
                      ? "bg-primary/15"
                      : "bg-primary/10"
                  }
                `}
              >
                {/* Icon with micro-animations */}
                <motion.div
                  animate={
                    isActive
                      ? {
                          y: [0, -3, 0],
                          scale: [1, 1.1, 1],
                        }
                      : { y: 0, scale: 1 }
                  }
                  transition={
                    isActive
                      ? {
                          y: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          scale: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }
                      : {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }
                  }
                  whileHover={{
                    y: -2,
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                >
                  <IconComponent
                    className={`h-7 w-7 transition-colors duration-200 ${
                      isActive ? "text-primary-foreground" : "text-primary"
                    }`}
                  />
                </motion.div>

                {/* Subtle glow ring on active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-primary-foreground/10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>

              {/* Title */}
              <h3
                className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                  isActive
                    ? "text-primary-foreground"
                    : isPast
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {step.title}
              </h3>

              {/* Description & Outcome */}
              <AnimatePresence mode="wait">
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    <p className="text-primary-foreground/85 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.2 }}
                      className="text-primary-foreground/70 text-xs italic border-t border-primary-foreground/20 pt-2"
                    >
                      {step.outcome}
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`text-sm leading-relaxed line-clamp-2 ${
                      isPast ? "text-primary/70" : "text-muted-foreground"
                    }`}
                  >
                    {step.description}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Dynamic Micro-copy */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <MicroCopyAnimator 
                      phrases={step.microCopy} 
                      isActive={isActive} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
