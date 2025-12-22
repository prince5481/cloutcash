import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface Match {
  id: string;
  name: string;
  avatar: string;
  niche: string;
  location: string;
  matchedAt: Date;
}

const mockMatches: Match[] = [
  {
    id: '1',
    name: 'Aarushi Mehta',
    avatar: 'https://picsum.photos/seed/match1/400/400',
    niche: 'Fitness',
    location: 'Indore',
    matchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '2',
    name: 'GlowVerve',
    avatar: 'https://picsum.photos/seed/match2/400/400',
    niche: 'Beauty',
    location: 'Mumbai',
    matchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  }
];

const MatchesPage = () => {
  const [matches] = useState<Match[]>(mockMatches);

  const showPremiumToast = () => {
    toast({
      title: '🔒 Premium Feature',
      description: 'Chat is available in the Premium Plan. Upgrade to start conversations with your matches.',
      duration: 4000,
    });
  };

  const formatMatchTime = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 pb-32">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Matches</h1>
            <p className="text-muted-foreground">
              {matches.length} mutual connection{matches.length !== 1 ? 's' : ''}
            </p>
          </div>

          {matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                <p className="text-muted-foreground mb-4">
                  Keep swiping to find your perfect collaboration partners!
                </p>
                <Button onClick={() => window.location.href = '/match'}>
                  Start Swiping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={match.avatar}
                        alt={match.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{match.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{match.niche}</Badge>
                          <span className="text-sm text-muted-foreground">• {match.location}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Matched {formatMatchTime(match.matchedAt)}
                        </p>
                      </div>

                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={showPremiumToast}
                        className="relative"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <Lock className="w-3 h-3 absolute -top-1 -right-1 text-primary" />
                      </Button>
                    </div>

                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-center text-muted-foreground">
                        💎 Upgrade to Premium to start chatting with your matches
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchesPage;
