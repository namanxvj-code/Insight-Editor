export interface Comment {
  id: string;
  username: string;
  profilePic: string;
  text: string;
  likes: number;
  timestamp: string;
  isLikedByOwner?: boolean;
}

export interface Insights {
  reach: number;
  impressions: number;
  accountsEngaged: number;
  profileVisits: number;
  follows: number;
  websiteTaps: number;
  shares: number;
  saves: number;
  likes?: number;
  reposts?: number;
  watchTime: string; // e.g., "14h 25m"
  avgWatchTime: string; // e.g., "0:18"
  demographicsWomenPercent?: number;
  demographicsAge_18_24?: number;
  demographicsAge_25_34?: number;
  demographicsTopCity?: string;
  demographicsTopCountry?: string;
  // Reel customized fields
  reelCaptionOverlay?: string;
  reelSends?: number;
  reelCommentsCount?: number;
  chartPointsAll?: number[];
  chartPointsFollowers?: number[];
  chartPointsNonFollowers?: number[];
  sectionTitleSummary?: string;
  sectionTitleViewsOverTime?: string;
  sectionTitleEngagement?: string;
  sectionTitleAudience?: string;
  labelViews?: string;
  labelAccountsReached?: string;
  labelAvgWatchTime?: string;
  labelFollows?: string;
  titleReelInsightsHeader?: string;
  reelMediaUrl?: string;
  skipRate?: string;
  shareRate?: string;
  likeRate?: string;
  saveRate?: string;
  repostRate?: string;
  commentRate?: string;
  retentionPoints?: number[];
  retentionDuration?: string;
  retentionStartTime?: string;
  retentionMaxLabel?: string;
  retentionMidLabel?: string;
  retentionMinLabel?: string;
  chartMaxLabel?: string;
  chartMidLabel?: string;
  chartMinLabel?: string;
  chartDateStart?: string;
  chartDateMid?: string;
  chartDateEnd?: string;
  sourceReelsTab?: string;
  sourceExplore?: string;
  sourceProfile?: string;
  sourceFeed?: string;
  sourceReelsTabLabel?: string;
  sourceExploreLabel?: string;
  sourceProfileLabel?: string;
  sourceFeedLabel?: string;
  sectionTitleTopSources?: string;
  whoViewedFollowersPercent?: string;
  whoViewedNonFollowersPercent?: string;
  audienceAge_13_17?: string;
  audienceAge_18_24?: string;
  audienceAge_25_34?: string;
  audienceAge_35_44?: string;
  audienceAge_45_54?: string;
  audienceAge_55_64?: string;
  audienceAge_65_plus?: string;
  audienceGenderMenPercent?: string;
  audienceGenderWomenPercent?: string;
  audienceCountry1_name?: string;
  audienceCountry1_pct?: string;
  audienceCountry2_name?: string;
  audienceCountry2_pct?: string;
  audienceCountry3_name?: string;
  audienceCountry3_pct?: string;
  audienceCountry4_name?: string;
  audienceCountry4_pct?: string;
  audienceCountry5_name?: string;
  audienceCountry5_pct?: string;
  views?: number;
}

export interface Post {
  id: string;
  type: 'image' | 'video' | 'carousel';
  mediaUrl: string;
  carouselImages?: string[];
  caption: string;
  likes: number;
  shares: number;
  saves: number;
  views: number;
  uploadDate: string; // e.g., "3 days ago"
  location: string;
  taggedUsers: string[];
  comments: Comment[];
  insights: Insights;
}

export interface Highlight {
  id: string;
  title: string;
  cover: string;
}

export interface InstagramProfile {
  id: string;
  projectName: string;
  username: string;
  displayName: string;
  profilePic: string;
  bio: string;
  website: string;
  category: string;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCountOverride?: number; // Optional manual override, otherwise computed
  highlights: Highlight[];
  posts: Post[];
  taggedPosts: Post[];
  activeTab: 'posts' | 'reels' | 'tagged';
}

export interface ProjectState {
  projects: InstagramProfile[];
  currentProjectId: string;
  theme: 'light' | 'dark';
}
