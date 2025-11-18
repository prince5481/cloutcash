import { Navbar } from '@/components/Navbar';
import { SwipeDeck } from '@/components/SwipeDeck';
import { MatchFilters } from '@/components/MatchFilters';
import { useMatchFeed } from '@/hooks/useMatchFeed';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Home, Heart, User } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MatchPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // For now, default to 'brand' role
  const role = 'brand';
  const { candidates, loading, hasMore, fetchMore, updateFilters } = useMatchFeed(role);
  const { recordFeedback } = useFeedback();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSwipe = async (candidateId: string, direction: 'left' | 'right' | 'up') => {
    const type = direction === 'left' ? 'pass' : direction === 'up' ? 'superlike' : 'like';
    await recordFeedback(candidateId, type);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar 
        onHomeClick={() => navigate("/")}
        onContactClick={() => navigate("/")}
        onAboutClick={() => navigate("/")}
      />
      <div className="min-h-screen bg-background pt-20 pb-24">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Discover Perfect Matches
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Swipe to find your ideal collaboration partners
            </p>
          </div>

          <MatchFilters onFilterChange={updateFilters} />

          <div className="mt-6">
            <SwipeDeck
              candidates={candidates}
              onSwipe={handleSwipe}
              onLoadMore={fetchMore}
              hasMore={hasMore}
            />
          </div>

          <div className="text-center mt-6 text-xs md:text-sm text-muted-foreground">
            <p>Swipe right to like • Swipe left to pass</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Button
              variant={location.pathname === '/match' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/match')}
              className="flex-col h-auto py-2 px-6"
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
            
            <Button
              variant={location.pathname === '/matches' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/matches')}
              className="flex-col h-auto py-2 px-6"
            >
              <Heart className="w-5 h-5 mb-1" />
              <span className="text-xs">Matches</span>
            </Button>
            
            <Button
              variant={location.pathname === '/profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/profile')}
              className="flex-col h-auto py-2 px-6"
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchPage;
