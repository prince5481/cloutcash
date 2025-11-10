interface ProfileData {
  email?: string;
  full_name?: string;
  location?: string;
  niche?: string;
  handle?: string;
  follower_count?: number;
  engagement_rate?: number;
  marketing_budget?: number;
  avatar_url?: string;
  bio?: string;
  website?: string;
  goal?: string;
  user_type: string;
  [key: string]: any;
}

interface ChecklistItem {
  label: string;
  completed: boolean;
  weight: number;
}

export interface ProfileCompletionResult {
  percentage: number;
  checklist: ChecklistItem[];
}

export function computeProfileCompletion(profile: ProfileData): ProfileCompletionResult {
  const isCreator = profile.user_type === "creator";
  const checklist: ChecklistItem[] = [];

  if (isCreator) {
    // Creator fields (9 items, ~11 points each)
    checklist.push(
      { label: "Email verified", completed: !!profile.email, weight: 11 },
      { label: "Name and city", completed: !!(profile.full_name && profile.location), weight: 11 },
      { label: "At least 2 niches", completed: (profile.niche?.split(",").length || 0) >= 2, weight: 11 },
      { label: "Social handle", completed: !!profile.handle, weight: 11 },
      { label: "Follower bracket", completed: !!profile.follower_count, weight: 11 },
      { label: "Engagement rate", completed: !!profile.engagement_rate, weight: 11 },
      { label: "At least 1 media sample", completed: false, weight: 11 }, // Not tracked yet
      { label: "Bio (120+ characters)", completed: (profile.bio?.length || 0) >= 120, weight: 11 },
      { label: "Profile avatar", completed: !!profile.avatar_url, weight: 12 }
    );
  } else {
    // Brand fields (10 items, 10 points each)
    checklist.push(
      { label: "Email verified", completed: !!profile.email, weight: 10 },
      { label: "Name and website", completed: !!(profile.full_name && profile.website), weight: 10 },
      { label: "Sector and niches", completed: !!profile.niche, weight: 10 },
      { label: "Monthly marketing budget", completed: !!profile.marketing_budget, weight: 10 },
      { label: "Target follower brackets", completed: !!profile.follower_count, weight: 10 },
      { label: "City/location", completed: !!profile.location, weight: 10 },
      { label: "Campaign objective", completed: !!profile.goal, weight: 10 },
      { label: "Brief (60+ characters)", completed: (profile.bio?.length || 0) >= 60, weight: 10 },
      { label: "At least 1 creative", completed: !!profile.avatar_url, weight: 10 },
      { label: "Short bio", completed: !!profile.bio, weight: 10 }
    );
  }

  const totalPoints = checklist.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);
  const percentage = Math.round(totalPoints);

  return { percentage, checklist };
}
