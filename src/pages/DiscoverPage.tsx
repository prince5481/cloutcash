import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, MapPin, DollarSign, TrendingUp, Users, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useMatchFeed } from '@/hooks/useMatchFeed';
import { useFeedback } from '@/hooks/useFeedback';
import { Navbar } from '@/components/Navbar';
import { Influencer } from '@/types/matchmaking';
import { toast } from '@/hooks/use-toast';

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { candidates, loading, fetchMore, hasMore, updateFilters, refetch } = useMatchFeed('brand');
  const { recordFeedback } = useFeedback();
  const [swipedCardIds, setSwipedCardIds] = useState<Set<string>>(new Set());
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

  // Filter states
  const [filterNiches, setFilterNiches] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterBudgetRange, setFilterBudgetRange] = useState([0, 100000]);
  const [filterEngagement, setFilterEngagement] = useState([0]);
  const [filterFollowers, setFilterFollowers] = useState([0]);

  // Filter out swiped cards
  const activeCards = candidates.filter(c => !swipedCardIds.has(c.item.id));
  const currentCandidate = activeCards[0];
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-25, 25]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  // Load more cards when running low
  useEffect(() => {
    if (activeCards.length < 3 && hasMore && !loading) {
      fetchMore();
    }
  }, [activeCards.length, hasMore, loading, fetchMore]);

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!currentCandidate) return;

    const cardId = currentCandidate.item.id;
    
    setExitDirection(direction);
    const interactionType = direction === 'right' ? 'like' : direction === 'up' ? 'superlike' : 'pass';
    recordFeedback(cardId, interactionType);
    setSwipedCardIds(prev => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 120;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      handleSwipe(info.offset.x > 0 ? 'right' : 'left');
    } else if (info.offset.y < -swipeThreshold) {
      handleSwipe('up');
    } else {
      // Snap back animation
      x.set(0);
      y.set(0);
    }
  };

  const handleApplyFilters = async () => {
    setIsApplyingFilters(true);
    
    await updateFilters({
      niches: filterNiches ? filterNiches.split(',').map(n => n.trim()) : undefined,
      geo: filterLocation ? filterLocation.split(',').map(l => l.trim()) : undefined,
      maxPrice: filterBudgetRange[1] > 0 ? filterBudgetRange[1] : undefined,
      minEngagement: filterEngagement[0] > 0 ? filterEngagement[0] : undefined,
      minFollowers: filterFollowers[0] > 0 ? filterFollowers[0] : undefined,
    });
    await refetch();
    
    // Clear swiped cards when applying new filters
    setSwipedCardIds(new Set());
    setExitDirection(null);
    setIsApplyingFilters(false);
    
    toast({
      title: "Filters Applied",
      description: "Showing updated results",
    });
  };

  const handleClearFilters = () => {
    setFilterNiches('');
    setFilterLocation('');
    setFilterBudgetRange([0, 100000]);
    setFilterEngagement([0]);
    setFilterFollowers([0]);
    updateFilters({});
    setSwipedCardIds(new Set());
    toast({
      title: "Filters Cleared",
      description: "Showing all profiles",
    });
  };

  if ((loading && candidates.length === 0) || isApplyingFilters) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isApplyingFilters ? 'Applying filters...' : 'Loading profiles...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Filters */}
        <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 text-foreground">Filters</h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="niche" className="text-sm font-medium">Niche</Label>
              <Input
                id="niche"
                placeholder="e.g., Fashion, Tech"
                value={filterNiches}
                onChange={(e) => setFilterNiches(e.target.value)}
                className="mt-2 bg-background/50"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, Delhi"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="mt-2 bg-background/50"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Budget Range (₹/post)</Label>
              <div className="mt-4 mb-2">
                <Slider
                  value={filterBudgetRange}
                  onValueChange={setFilterBudgetRange}
                  max={100000}
                  step={5000}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>₹{filterBudgetRange[0].toLocaleString()}</span>
                  <span>₹{filterBudgetRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Min Engagement Rate (%)</Label>
              <div className="mt-4 mb-2">
                <Slider
                  value={filterEngagement}
                  onValueChange={setFilterEngagement}
                  max={20}
                  step={0.5}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {filterEngagement[0]}%
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Min Followers</Label>
              <div className="mt-4 mb-2">
                <Slider
                  value={filterFollowers}
                  onValueChange={setFilterFollowers}
                  max={1000000}
                  step={10000}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {filterFollowers[0].toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleApplyFilters} 
                className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(354,78%,58%,0.3)]"
                disabled={isApplyingFilters}
              >
                {isApplyingFilters ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply Filters'
                )}
              </Button>
              <Button 
                onClick={handleClearFilters} 
                variant="outline" 
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Swipe Cards */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
          {currentCandidate ? (
            <div className="relative w-full max-w-md">
              {/* Card Stack */}
              <div className="relative h-[620px]">
                {/* Background cards with stagger effect */}
                {activeCards.slice(1, 3).map((candidate, idx) => (
                  <motion.div
                    key={candidate.item.id}
                    initial={{ scale: 1 - (idx + 2) * 0.05, y: -(idx + 2) * 10 }}
                    animate={{ 
                      scale: 1 - (idx + 1) * 0.05, 
                      y: -(idx + 1) * 10,
                      opacity: 1 - (idx + 1) * 0.25 
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute inset-0"
                    style={{ zIndex: -idx - 1 }}
                  >
                    <Card className="h-full bg-card/80 border border-border/50 backdrop-blur-sm overflow-hidden" />
                  </motion.div>
                ))}

                {/* Active card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCandidate.item.id}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{
                      x: exitDirection === 'left' ? -400 : exitDirection === 'right' ? 400 : 0,
                      y: exitDirection === 'up' ? -400 : 0,
                      opacity: 0,
                      scale: 0.8,
                      rotate: exitDirection === 'left' ? -30 : exitDirection === 'right' ? 30 : 0,
                      transition: { duration: 0.3, ease: "easeIn" }
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 25,
                      opacity: { duration: 0.2 }
                    }}
                    style={{
                      x,
                      y,
                      rotate,
                    }}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.7}
                    onDragEnd={handleDragEnd}
                    onAnimationComplete={(definition) => {
                      if (definition === 'exit') {
                        x.set(0);
                        y.set(0);
                        setExitDirection(null);
                      }
                    }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  >
                    <Card className="h-full bg-card border-2 border-primary/20 overflow-hidden shadow-[0_0_40px_rgba(354,78%,58%,0.25)] hover:shadow-[0_0_50px_rgba(354,78%,58%,0.35)] transition-shadow">
                      <ProfileCard influencer={currentCandidate.item} matchScore={currentCandidate.score} />
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center items-center gap-6 mt-10">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-16 h-16 rounded-full border-2 border-destructive hover:bg-destructive/10 hover:scale-110 transition-all shadow-lg hover:shadow-destructive/20"
                  onClick={() => handleSwipe('left')}
                >
                  <X className="w-8 h-8 text-destructive" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="w-16 h-16 rounded-full border-2 border-accent hover:bg-accent/10 hover:scale-110 transition-all shadow-lg hover:shadow-accent/20"
                  onClick={() => handleSwipe('up')}
                >
                  <Star className="w-8 h-8 text-accent" />
                </Button>
                
                <Button
                  size="lg"
                  className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-all shadow-[0_0_30px_rgba(354,78%,58%,0.4)] hover:shadow-[0_0_40px_rgba(354,78%,58%,0.6)]"
                  onClick={() => handleSwipe('right')}
                >
                  <Heart className="w-10 h-10 fill-primary-foreground" />
                </Button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No more profiles</h3>
              <p className="text-muted-foreground mb-4">Adjust your filters to see more</p>
              <Button onClick={handleClearFilters} className="bg-primary hover:bg-primary/90">
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ influencer, matchScore }: { influencer: Influencer; matchScore: number }) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-card to-card/95">
      {/* Match Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1.5 text-sm font-bold shadow-[0_0_25px_rgba(354,78%,58%,0.6)] border border-primary/30 backdrop-blur-sm">
          {Math.round(matchScore * 100)}% Match
        </Badge>
      </div>

      {/* Profile Image */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/10">
        {influencer.avatar ? (
          <img
            src={influencer.avatar}
            alt={influencer.name || influencer.handle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shadow-[0_0_30px_rgba(354,78%,58%,0.4)]">
              <Users className="w-16 h-16 text-primary" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{influencer.name || influencer.handle}</h3>
          <p className="text-muted-foreground text-sm">@{influencer.handle}</p>
        </div>

        {/* Niche Badge */}
        <div>
          <Badge variant="secondary" className="text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
            {influencer.niches[0]}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm bg-background/50 rounded-lg px-3 py-2 border border-border/50">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate">{influencer.audienceGeo[0]}</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-background/50 rounded-lg px-3 py-2 border border-border/50">
            <DollarSign className="w-4 h-4 text-accent flex-shrink-0" />
            <span>₹{(influencer.pricePerPost / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-background/50 rounded-lg px-3 py-2 border border-border/50">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{(influencer.followers / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-background/50 rounded-lg px-3 py-2 border border-border/50">
            <TrendingUp className="w-4 h-4 text-accent flex-shrink-0" />
            <span>{influencer.engagementRate}%</span>
          </div>
        </div>

        {/* Bio */}
        {influencer.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{influencer.bio}</p>
        )}

        {/* Mini Insights */}
        <div className="pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-primary/5 rounded-lg py-2 border border-primary/10">
              <div className="text-xs text-muted-foreground mb-1">Overlap</div>
              <div className="text-sm font-bold text-primary">
                {Math.round(matchScore * 85)}%
              </div>
            </div>
            <div className="bg-accent/5 rounded-lg py-2 border border-accent/10">
              <div className="text-xs text-muted-foreground mb-1">Engagement</div>
              <div className="text-sm font-bold text-accent">
                {influencer.engagementRate > 5 ? 'High' : influencer.engagementRate > 2 ? 'Mid' : 'Low'}
              </div>
            </div>
            <div className="bg-primary/5 rounded-lg py-2 border border-primary/10">
              <div className="text-xs text-muted-foreground mb-1">Fit</div>
              <div className="text-sm font-bold text-primary">
                {matchScore > 0.8 ? 'Great' : matchScore > 0.6 ? 'Good' : 'Fair'}
              </div>
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="flex gap-2 flex-wrap">
          {influencer.platforms.map(platform => (
            <Badge 
              key={platform} 
              variant="outline" 
              className="text-xs border-primary/30 text-primary hover:bg-primary/10 transition-colors"
            >
              {platform}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
