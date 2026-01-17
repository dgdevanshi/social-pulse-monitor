import { SocialPost, TrendDataPoint, TrackedKeyword, SentimentType, SocialSource } from '@/types/social';

const sources: SocialSource[] = ['twitter', 'reddit', 'facebook', 'instagram', 'linkedin'];
const sentiments: SentimentType[] = ['positive', 'neutral', 'negative'];
const keywords = ['TechBrand', 'ProductX', 'CustomerService', 'NewFeature'];

const sampleAuthors = [
  { name: 'Sarah Chen', handle: '@sarahc_dev' },
  { name: 'Mike Johnson', handle: '@mjohnson' },
  { name: 'Alex Rivera', handle: '@arivera_tech' },
  { name: 'Emma Wilson', handle: '@emmaw' },
  { name: 'David Park', handle: '@dpark_io' },
  { name: 'Lisa Thompson', handle: '@lisaT' },
  { name: 'James Lee', handle: '@jameslee' },
  { name: 'Anna Schmidt', handle: '@annaschmidt' },
];

const positiveContents = [
  "Just tried {keyword} and I'm absolutely blown away! The quality is incredible 🚀",
  "Huge shoutout to {keyword} team for the amazing customer support! Fixed my issue in minutes 💯",
  "Been using {keyword} for 3 months now. Best decision I've made this year! Highly recommend 👏",
  "{keyword} just keeps getting better. Love the new updates!",
  "The {keyword} team really listens to feedback. New feature is exactly what we needed!",
];

const neutralContents = [
  "Has anyone tried {keyword} yet? Thinking about switching from my current solution.",
  "Just saw the {keyword} announcement. Interesting approach, let's see how it plays out.",
  "{keyword} updated their pricing. Different tiers available now.",
  "Comparing {keyword} with competitors. Still doing my research.",
  "The {keyword} webinar is starting in 30 mins. Anyone joining?",
];

const negativeContents = [
  "Disappointed with {keyword} today. Been waiting 2 hours for support response 😤",
  "The latest {keyword} update broke my workflow. Not happy about this.",
  "{keyword} needs to fix their app performance ASAP. It's been laggy all week.",
  "Had high hopes for {keyword} but the experience has been frustrating lately.",
  "Why is {keyword} so difficult to use? The UX needs serious work.",
];

function getRandomContent(sentiment: SentimentType, keyword: string): string {
  let contents: string[];
  switch (sentiment) {
    case 'positive':
      contents = positiveContents;
      break;
    case 'neutral':
      contents = neutralContents;
      break;
    case 'negative':
      contents = negativeContents;
      break;
  }
  const content = contents[Math.floor(Math.random() * contents.length)];
  return content.replace('{keyword}', keyword);
}

function generateRandomPost(id: number, hoursAgo: number = Math.random() * 48): SocialPost {
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];
  const author = sampleAuthors[Math.floor(Math.random() * sampleAuthors.length)];
  
  return {
    id: `post-${id}`,
    content: getRandomContent(sentiment, keyword),
    timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
    source: sources[Math.floor(Math.random() * sources.length)],
    keyword,
    sentiment,
    confidenceScore: 0.7 + Math.random() * 0.3,
    author,
    engagement: {
      likes: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
    },
  };
}

export function generateMockPosts(count: number = 50): SocialPost[] {
  return Array.from({ length: count }, (_, i) => generateRandomPost(i, Math.random() * 72));
}

export function generateTrendData(hours: number = 24): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Add some realistic variation
    const basePositive = 15 + Math.floor(Math.random() * 10);
    const baseNeutral = 20 + Math.floor(Math.random() * 15);
    // Simulate a negative spike in the middle of the timeline
    const isNegativeSpike = i >= 8 && i <= 12;
    const baseNegative = isNegativeSpike 
      ? 25 + Math.floor(Math.random() * 20) 
      : 8 + Math.floor(Math.random() * 8);
    
    data.push({
      timestamp: timestamp.toISOString(),
      positive: basePositive,
      neutral: baseNeutral,
      negative: baseNegative,
    });
  }
  
  return data;
}

export const defaultKeywords: TrackedKeyword[] = [
  { id: 'kw-1', keyword: 'TechBrand', isActive: true, createdAt: new Date() },
  { id: 'kw-2', keyword: 'ProductX', isActive: true, createdAt: new Date() },
  { id: 'kw-3', keyword: 'CustomerService', isActive: true, createdAt: new Date() },
  { id: 'kw-4', keyword: 'NewFeature', isActive: false, createdAt: new Date() },
];
