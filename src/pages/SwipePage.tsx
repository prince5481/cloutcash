import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Star, Heart, SlidersHorizontal, MapPin, DollarSign, TrendingUp, Users, ExternalLink, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMatchFeed } from '@/hooks/useMatchFeed';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { ScoredCandidate, Influencer, MatchFilters } from '@/types/matchmaking';

const SwipePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { candidates, loading, hasMore, fetchMore, updateFilters } = useMatchFeed('brand');
  const { recordFeedback } = useFeedback();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Influencer | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  
  // Filter states
  const [filterNiches, setFilterNiches] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterBudgetRange, setFilterBudgetRange] = useState<[number, number]>([0, 50000]);
  const [filterEngagement, setFilterEngagement] = useState<[number]>([0]);
  const [filterFollowers, setFilterFollowers] = useState<[number]>([0]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Colored glows based on swipe direction
  const leftGlow = useTransform(x, [0, -150], [0, 1]);
  const rightGlow = useTransform(x, [0, 150], [0, 1]);
  const upGlow = useTransform(y, [0, -150], [0, 1]);

  const currentCard = candidates[currentIndex];
  const queueCount = candidates.length - currentIndex;

  useEffect(() => {
    // Load more when running low
    if (currentIndex >= candidates.length - 3 && hasMore && !loading) {
      fetchMore();
    }
  }, [currentIndex, candidates.length, hasMore, loading, fetchMore]);

  useEffect(() => {
    // Keyboard support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('left');
      else if (e.key === 'ArrowRight') handleSwipe('right');
      else if (e.key === 'ArrowUp') handleSwipe('up');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, candidates]);

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    if (!currentCard) return;

    setExitDirection(direction);
    setExitX(direction === 'left' ? -300 : direction === 'right' ? 300 : 0);

    // Record feedback
    const type = direction === 'left' ? 'pass' : direction === 'up' ? 'superlike' : 'like';
    await recordFeedback(currentCard.item.id, type);

    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitX(0);
      setExitDirection(null);
      x.set(0);
      y.set(0);
    }, 300);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      handleSwipe(info.offset.x > 0 ? 'right' : 'left');
    } else if (info.offset.y < -threshold) {
      handleSwipe('up');
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleApplyFilters = () => {
    const filters: MatchFilters = {};
    
    if (filterNiches) {
      filters.niches = filterNiches.split(',').map(n => n.trim()).filter(Boolean);
    }
    if (filterLocation) {
      filters.geo = filterLocation.split(',').map(l => l.trim()).filter(Boolean);
    }
    if (filterBudgetRange[1] < 50000) {
      filters.maxPrice = filterBudgetRange[1];
    }
    if (filterEngagement[0] > 0) {
      filters.minEngagement = filterEngagement[0];
    }
    
    updateFilters(filters);
    setFilterSheetOpen(false);
    setCurrentIndex(0);
  };

  const handleClearFilters = () => {
    setFilterNiches('');
    setFilterLocation('');
    setFilterBudgetRange([0, 50000]);
    setFilterEngagement([0]);
    setFilterFollowers([0]);
    updateFilters({});
    setFilterSheetOpen(false);
    setCurrentIndex(0);
  };

  if (!user) return null;

  if (loading && candidates.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading matches...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-background pt-16 pb-32">
        {/* Top Bar */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Swipe Brands</h1>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  Queue: {queueCount}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setFilterSheetOpen(true)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Deck */}
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="relative h-[600px] flex items-center justify-center">
            {currentIndex >= candidates.length ? (
              // Empty State
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Heart className="w-16 h-16 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No More Matches</h2>
                <p className="text-muted-foreground mb-6">
                  You've seen all available brands. Check back later for more!
                </p>
                <Button onClick={() => navigate('/dashboard')} size="lg">
                  Find More Matches
                </Button>
              </motion.div>
            ) : (
              <>
                {/* Stack of cards (show 3 max) */}
                {candidates.slice(currentIndex, currentIndex + 3).map((candidate, idx) => {
                  const isActive = idx === 0;
                  const scale = 1 - idx * 0.05;
                  const yOffset = idx * 10;

                  if (!isActive) {
                    // Background cards
                    return (
                      <div
                        key={candidate.item.id}
                        className="absolute inset-0 max-w-md mx-auto"
                        style={{
                          transform: `scale(${scale}) translateY(${yOffset}px)`,
                          zIndex: 10 - idx,
                          opacity: 1 - idx * 0.3,
                        }}
                      >
                        <CardContent 
                          profile={candidate.item} 
                          matchScore={Math.floor(candidate.score * 100)}
                          isHovered={false}
                          onViewProfile={() => {}}
                        />
                      </div>
                    );
                  }

                  // Active card
                  return (
                    <motion.div
                      key={candidate.item.id}
                      className="absolute inset-0 max-w-md mx-auto cursor-grab active:cursor-grabbing"
                      style={{
                        x: exitDirection ? exitX : x,
                        y: exitDirection ? (exitDirection === 'up' ? -300 : 0) : y,
                        rotate,
                        opacity,
                        zIndex: 20,
                      }}
                      drag={exitDirection ? false : true}
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDragEnd={handleDragEnd}
                      dragElastic={0.7}
                      animate={exitDirection ? {
                        x: exitDirection === 'left' ? -300 : exitDirection === 'right' ? 300 : 0,
                        y: exitDirection === 'up' ? -300 : 0,
                        opacity: 0,
                      } : {}}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      onMouseEnter={() => setHoveredCardId(candidate.item.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                    >
                      {/* Colored glows */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          opacity: leftGlow,
                          boxShadow: '0 0 40px 10px hsl(var(--destructive) / 0.5)',
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          opacity: rightGlow,
                          boxShadow: '0 0 40px 10px hsl(var(--primary) / 0.5)',
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          opacity: upGlow,
                          boxShadow: '0 0 40px 10px hsl(var(--accent) / 0.5)',
                        }}
                      />
                      
                      <CardContent 
                        profile={candidate.item} 
                        matchScore={Math.floor(candidate.score * 100)}
                        isHovered={hoveredCardId === candidate.item.id}
                        onViewProfile={() => {
                          setSelectedProfile(candidate.item);
                          setProfileSheetOpen(true);
                        }}
                      />
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p className="hidden md:block">Use ← / → / ↑ arrow keys or swipe on mobile</p>
            <p className="md:hidden">Swipe right to Connect • Swipe left to Pass • Swipe up to Save</p>
          </div>
        </div>

        {/* Bottom Action Bar */}
        {currentIndex < candidates.length && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t z-50">
            <div className="container max-w-2xl mx-auto px-4 py-6">
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-16 h-16 rounded-full hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                  onClick={() => handleSwipe('left')}
                >
                  <X className="w-8 h-8" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="w-16 h-16 rounded-full hover:bg-accent/10 hover:border-accent hover:text-accent"
                  onClick={() => handleSwipe('up')}
                >
                  <Star className="w-8 h-8" />
                </Button>
                
                <Button
                  size="lg"
                  className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
                  onClick={() => handleSwipe('right')}
                >
                  <Heart className="w-8 h-8" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Side Sheet */}
        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Matches</SheetTitle>
              <SheetDescription>
                Refine your match feed with custom filters
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Niche */}
              <div className="space-y-2">
                <Label htmlFor="niche">Niches</Label>
                <Input
                  id="niche"
                  placeholder="e.g., Fashion, Tech, Fitness (comma separated)"
                  value={filterNiches}
                  onChange={(e) => setFilterNiches(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter niches separated by commas
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., US, UK, Global (comma separated)"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter locations separated by commas
                </p>
              </div>

              {/* Budget Range */}
              <div className="space-y-3">
                <Label>Budget Range (per post)</Label>
                <div className="px-2">
                  <Slider
                    value={filterBudgetRange}
                    onValueChange={(value) => setFilterBudgetRange(value as [number, number])}
                    max={50000}
                    step={1000}
                    className="mb-2"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${filterBudgetRange[0].toLocaleString()}</span>
                  <span>${filterBudgetRange[1].toLocaleString()}{filterBudgetRange[1] === 50000 ? '+' : ''}</span>
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="space-y-3">
                <Label>Minimum Engagement Rate</Label>
                <div className="px-2">
                  <Slider
                    value={filterEngagement}
                    onValueChange={(value) => setFilterEngagement(value as [number])}
                    max={20}
                    step={0.5}
                    className="mb-2"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {filterEngagement[0]}%+
                </div>
              </div>

              {/* Follower Count */}
              <div className="space-y-3">
                <Label>Minimum Followers</Label>
                <div className="px-2">
                  <Slider
                    value={filterFollowers}
                    onValueChange={(value) => setFilterFollowers(value as [number])}
                    max={1000000}
                    step={10000}
                    className="mb-2"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {filterFollowers[0].toLocaleString()}+
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Profile Side Sheet */}
        <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            {selectedProfile && (
              <>
                <SheetHeader>
                  <SheetTitle>{selectedProfile.name || selectedProfile.handle}</SheetTitle>
                  <SheetDescription>
                    Full profile details and statistics
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Avatar */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedProfile.avatar}
                      alt={selectedProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Basic Info */}
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProfile.bio || 'No bio available'}
                    </p>
                  </div>

                  {/* Niches */}
                  <div>
                    <h3 className="font-semibold mb-2">Niches</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.niches.map((niche) => (
                        <Badge key={niche} variant="secondary">
                          {niche}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <h3 className="font-semibold mb-3">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Followers</p>
                        <p className="text-lg font-bold">{selectedProfile.followers.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                        <p className="text-lg font-bold">{selectedProfile.engagementRate}%</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Avg Views</p>
                        <p className="text-lg font-bold">{selectedProfile.avgViews.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Price/Post</p>
                        <p className="text-lg font-bold">${selectedProfile.pricePerPost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <h3 className="font-semibold mb-2">Platforms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.platforms.map((platform) => (
                        <Badge key={platform} variant="outline">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Audience */}
                  <div>
                    <h3 className="font-semibold mb-2">Audience</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedProfile.audienceGeo.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Age: {selectedProfile.audienceAge.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Past Brands */}
                  {selectedProfile.pastBrands.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Past Collaborations</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.pastBrands.map((brand) => (
                          <Badge key={brand} variant="secondary">
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

// Card Content Component
const CardContent = ({ 
  profile, 
  matchScore, 
  isHovered, 
  onViewProfile 
}: { 
  profile: Influencer; 
  matchScore: number;
  isHovered: boolean;
  onViewProfile: () => void;
}) => {
  // Generate mock deliverables based on profile
  const deliverables = [
    `${profile.platforms[0]} content creation`,
    `${profile.niches[0]} targeted campaigns`,
    `Story & feed posts included`
  ];

  // Calculate mock insights
  const audienceOverlap = Math.floor(60 + Math.random() * 30);
  const engagementTier = profile.engagementRate > 5 ? 'High' : profile.engagementRate > 3 ? 'Medium' : 'Good';
  const toneFit = matchScore > 85 ? 'Excellent' : matchScore > 70 ? 'Good' : 'Fair';

  return (
    <div className="w-full h-[580px] bg-card border rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Image with Match Badge */}
      <div className="relative h-48 bg-muted flex-shrink-0">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {/* Match % Badge */}
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 text-sm font-bold">
          {matchScore}% Match
        </Badge>

        {/* View Profile Link (on hover) */}
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
            className="absolute bottom-3 right-3 bg-background/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium hover:bg-background transition-colors flex items-center gap-2"
          >
            View Profile
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-4 flex-1 flex flex-col overflow-hidden">
        {/* Name & Industry Tag */}
        <div>
          <h3 className="font-bold text-xl line-clamp-1 mb-2">
            {profile.name || profile.handle}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              {profile.niches[0]}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {profile.audienceGeo[0] || 'Global'}
            </span>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="font-semibold">${profile.pricePerPost.toLocaleString()}/post</span>
          <span className="text-muted-foreground">• Budget ready</span>
        </div>

        {/* Deliverables */}
        <div className="space-y-1.5 flex-shrink-0">
          {deliverables.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span className="text-muted-foreground line-clamp-1">{item}</span>
            </div>
          ))}
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t mt-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Target className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{audienceOverlap}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Audience</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{engagementTier}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Engagement</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{toneFit}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Tone Fit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipePage;
