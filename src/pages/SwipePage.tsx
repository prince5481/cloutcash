import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, Heart, SlidersHorizontal, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMatchFeed } from '@/hooks/useMatchFeed';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { ScoredCandidate, Influencer } from '@/types/matchmaking';

const SwipePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { candidates, loading, hasMore, fetchMore } = useMatchFeed('brand');
  const { recordFeedback } = useFeedback();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

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

  if (!user) return null;

  if (loading && candidates.length === 0) {
    return (
      <>
        <Navbar 
          onHomeClick={() => navigate("/")}
          onContactClick={() => navigate("/")}
          onAboutClick={() => navigate("/")}
        />
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
      <Navbar 
        onHomeClick={() => navigate("/")}
        onContactClick={() => navigate("/")}
        onAboutClick={() => navigate("/")}
      />
      
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
                <Button variant="outline" size="sm" className="gap-2">
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
                        <CardContent profile={candidate.item} />
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
                      
                      <CardContent profile={candidate.item} />
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
      </div>
    </>
  );
};

// Card Content Component
const CardContent = ({ profile }: { profile: Influencer }) => {
  return (
    <div className="w-full h-full bg-card border rounded-2xl overflow-hidden shadow-xl">
      {/* Image */}
      <div className="relative h-96 bg-muted">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-1">{profile.name || profile.handle}</h2>
          <p className="text-white/90 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {profile.audienceGeo[0] || 'Global'}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {profile.niches.slice(0, 3).map((niche) => (
            <Badge key={niche} variant="secondary">
              {niche}
            </Badge>
          ))}
        </div>

        <p className="text-muted-foreground line-clamp-2">{profile.bio || 'No bio available'}</p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Price/Post</p>
              <p className="font-semibold">${profile.pricePerPost.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Engagement</p>
              <p className="font-semibold">{profile.engagementRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipePage;
