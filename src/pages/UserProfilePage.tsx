import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  Calendar, 
  Briefcase, 
  MapPin, 
  Users, 
  TrendingUp, 
  DollarSign,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Heart,
  Globe,
  Target,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  full_name: string;
  user_type: 'creator' | 'brand';
  handle?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  niche?: string;
  follower_count?: number;
  engagement_rate?: number;
  marketing_budget?: number;
  website?: string;
  goal?: string;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchScore] = useState(Math.floor(Math.random() * 20) + 75); // Mock match score

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Could not load profile',
          variant: 'destructive',
        });
        navigate('/discover');
        return;
      }

      if (data) {
        setProfile({
          ...data,
          user_type: data.user_type as 'creator' | 'brand',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id, navigate]);

  const handleMessage = async () => {
    if (!profile || !user) return;

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(creator_id.eq.${user.id},brand_id.eq.${profile.id}),and(creator_id.eq.${profile.id},brand_id.eq.${user.id})`)
      .maybeSingle();

    if (existingConv) {
      navigate('/messages');
      return;
    }

    // Create new conversation
    const { error } = await supabase.from('conversations').insert({
      creator_id: profile.user_type === 'creator' ? profile.id : user.id,
      brand_id: profile.user_type === 'brand' ? profile.id : user.id,
    });

    if (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Could not start conversation',
        variant: 'destructive',
      });
      return;
    }

    navigate('/messages');
    toast({
      title: 'Conversation Started',
      description: `You can now chat with ${profile.full_name}`,
    });
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

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </>
    );
  }

  const isCreator = profile.user_type === 'creator';

  // Mock data for enhanced profile
  const platforms = ['Instagram', 'YouTube', 'TikTok'];
  const topGeo = ['United States', 'United Kingdom', 'Canada'];
  const ageGroups = ['18-24: 35%', '25-34: 45%', '35-44: 20%'];
  const genderSplit = 'Female 60% • Male 35% • Other 5%';
  const mediaGallery = Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/media${i}/400/400`);

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-background pt-20 pb-32">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/banner/1920/400')] bg-cover bg-center opacity-20 blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </motion.div>

        <div className="container max-w-6xl mx-auto px-4 -mt-32 relative z-10">
          {/* Profile Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <Avatar className="w-32 h-32 border-4 border-primary shadow-[0_0_30px_rgba(230,57,70,0.4)]">
                    <AvatarImage src={profile.avatar_url || `https://picsum.photos/seed/user${profile.id}/200/200`} />
                    <AvatarFallback className="text-3xl">{profile.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                      <Badge variant="outline" className="w-fit mx-auto md:mx-0">
                        {isCreator ? 'Creator' : 'Brand'}
                      </Badge>
                      <Badge className="w-fit mx-auto md:mx-0 bg-primary/20 text-primary border-primary/40">
                        <Heart className="w-3 h-3 mr-1 fill-primary" />
                        {matchScore}% Match
                      </Badge>
                    </div>
                    
                    {profile.handle && (
                      <p className="text-lg text-muted-foreground mb-3">@{profile.handle}</p>
                    )}

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </span>
                      )}
                      {profile.niche && (
                        <Badge variant="secondary">{profile.niche}</Badge>
                      )}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Button onClick={handleMessage} className="gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        Invite to Campaign
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Schedule Call
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8"
          >
            {isCreator ? (
              <>
                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{profile.follower_count?.toLocaleString() || '50K'}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{profile.engagement_rate || 4.2}%</p>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">$2,500</p>
                    <p className="text-sm text-muted-foreground">Price/Post</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold">United States</p>
                    <p className="text-xs text-muted-foreground">Top Audience Geo</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <div className="flex justify-center gap-2 mb-2">
                      <Instagram className="w-6 h-6 text-primary" />
                      <Youtube className="w-6 h-6 text-primary" />
                      <Twitter className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Platforms</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-primary fill-primary" />
                    <p className="text-2xl font-bold">{matchScore}%</p>
                    <p className="text-sm text-muted-foreground">Match Score</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">${profile.marketing_budget?.toLocaleString() || '50K'}</p>
                    <p className="text-sm text-muted-foreground">Budget Range</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold">{profile.niche || 'Beauty & Wellness'}</p>
                    <p className="text-xs text-muted-foreground">Campaign Category</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold">Micro-Influencers</p>
                    <p className="text-xs text-muted-foreground">Creator Preference</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold">{profile.location || 'Multiple'}</p>
                    <p className="text-xs text-muted-foreground">Target Location</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold">18-34, Female</p>
                    <p className="text-xs text-muted-foreground">Target Audience</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-primary fill-primary" />
                    <p className="text-2xl font-bold">{matchScore}%</p>
                    <p className="text-sm text-muted-foreground">Match Score</p>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio || 
                    (isCreator 
                      ? "Passionate content creator focused on authentic storytelling and building genuine connections with my audience. I specialize in lifestyle, beauty, and wellness content that resonates with modern consumers."
                      : "We're a forward-thinking brand committed to authentic partnerships with creators who share our values. Our campaigns focus on driving real engagement and building lasting relationships with our target audience."
                    )
                  }
                </p>
                {profile.goal && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-semibold mb-1">Campaign Goal</p>
                    <p className="text-sm text-muted-foreground">{profile.goal}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Expertise/Niches or Industry */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>{isCreator ? 'Expertise & Niches' : 'Industry Tags'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {isCreator ? (
                    <>
                      <Badge variant="secondary" className="text-sm">Beauty</Badge>
                      <Badge variant="secondary" className="text-sm">Lifestyle</Badge>
                      <Badge variant="secondary" className="text-sm">Fashion</Badge>
                      <Badge variant="secondary" className="text-sm">Wellness</Badge>
                      <Badge variant="secondary" className="text-sm">Travel</Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-sm">E-commerce</Badge>
                      <Badge variant="secondary" className="text-sm">Consumer Goods</Badge>
                      <Badge variant="secondary" className="text-sm">Digital Marketing</Badge>
                      <Badge variant="secondary" className="text-sm">B2C</Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Audience Demographics (Creators) or Campaign Info (Brands) */}
          {isCreator ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Audience Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Top Locations</h4>
                      <div className="space-y-1">
                        {topGeo.map((geo, i) => (
                          <p key={i} className="text-sm text-muted-foreground">{geo}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Age Brackets</h4>
                      <div className="space-y-1">
                        {ageGroups.map((age, i) => (
                          <p key={i} className="text-sm text-muted-foreground">{age}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Gender Split</h4>
                      <p className="text-sm text-muted-foreground">{genderSplit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Campaign Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Campaign Types</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">• Product Reviews</p>
                        <p className="text-sm text-muted-foreground">• Unboxing Videos</p>
                        <p className="text-sm text-muted-foreground">• Brand Storytelling</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Deliverables</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">• 3 Instagram Posts</p>
                        <p className="text-sm text-muted-foreground">• 5 Stories</p>
                        <p className="text-sm text-muted-foreground">• 1 Reel</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Content Guidelines</h4>
                      <p className="text-sm text-muted-foreground">
                        Authentic, lifestyle-focused content that showcases product in daily use scenarios.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Timeline</h4>
                      <p className="text-sm text-muted-foreground">2-3 weeks campaign duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Media Gallery (Creators) or Past Collaborations (Brands) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreator ? 'Media Gallery' : 'Past Collaborations'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCreator ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaGallery.map((img, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="aspect-square rounded-lg overflow-hidden border border-primary/10 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                      >
                        <img 
                          src={img} 
                          alt={`Media ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-gradient-to-br from-card/50 to-card border-primary/10">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={`https://picsum.photos/seed/collab${i}/100/100`} />
                              <AvatarFallback>C{i}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">Creator Name {i}</p>
                              <p className="text-sm text-muted-foreground">Campaign completed • 95% success rate</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">Beauty</Badge>
                                <Badge variant="outline" className="text-xs">Lifestyle</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
