export type SentimentType = 'positive' | 'neutral' | 'negative';

export type SocialSource = 'twitter' | 'reddit' | 'facebook' | 'instagram' | 'linkedin';

export interface SocialPost {
  id: string;
  content: string;
  timestamp: Date;
  source: SocialSource;
  keyword: string;
  sentiment: SentimentType;
  confidenceScore: number;
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface SentimentStats {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface TrendDataPoint {
  timestamp: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface TrackedKeyword {
  id: string;
  keyword: string;
  isActive: boolean;
  createdAt: Date;
}
