import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Users, DollarSign, Lock } from 'lucide-react';
import { mockInfluencers, mockBrandCampaigns } from '@/lib/mockData';
import { MatchModal } from '@/components/MatchModal';
import { toast } from '@/hooks/use-toast';

interface RecommendedMatchesProps {
  userType: 'creator' | 'brand';
}

export function RecommendedMatches({ userType }: RecommendedMatchesProps) {
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  // Get 5 random matches based on user type
  const matches = userType === 'creator' 
    ? mockBrandCampaigns.slice(0, 5)
    : mockInfluencers.slice(0, 5);

  const handleConnect = (match: any) => {
    setSelectedMatch({
      name: userType === 'creator' ? match.brandName : match.name,
      avatar: userType === 'creator' ? match.logo : match.avatar,
      niche: userType === 'creator' ? match.categories[0] : match.niches[0],
    });
    setMatchModalOpen(true);
  };

  const handleViewProfile = () => {
    toast({
      title: '🔒 Premium Feature',
      description: 'Full profile viewing is available in the Premium Plan. Upgrade to see detailed profiles.',
      duration: 4000,
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended for You (AI-Suggested)
          </CardTitle>
          <CardDescription>
            {userType === 'creator' 
              ? 'Top brands matched to your profile and audience'
              : 'Top creators matched to your brand and campaigns'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {matches.map((match: any) => (
              <motion.div key={match.id} variants={item}>
                <Card className="overflow-hidden hover-lift border-border/50">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={userType === 'creator' ? match.logo : match.avatar}
                      alt={userType === 'creator' ? match.brandName : match.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {userType === 'creator' ? match.brandName : match.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {userType === 'creator' ? match.categories[0] : match.niches[0]}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{userType === 'creator' ? match.targetGeo[0] : match.audienceGeo[0]}</span>
                      </div>
                      
                      {userType === 'creator' ? (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>₹{(match.budgetCoins / 100000).toFixed(1)}L monthly</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{(match.followers / 1000).toFixed(0)}K followers</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleConnect(match)}
                        className="flex-1"
                        size="sm"
                      >
                        Connect
                      </Button>
                      <Button 
                        onClick={handleViewProfile}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>

      {selectedMatch && (
        <MatchModal
          isOpen={matchModalOpen}
          onClose={() => setMatchModalOpen(false)}
          matchProfile={selectedMatch}
        />
      )}
    </>
  );
}
