import { SocialPost, SentimentType } from '@/types/social';
import { SentimentBadge } from './SentimentBadge';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Heart, Share2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostFeedProps {
  posts: SocialPost[];
  currentFilter: SentimentType | 'all';
  onFilterChange: (filter: SentimentType | 'all') => void;
  className?: string;
}

const sourceIcons: Record<string, string> = {
  twitter: '𝕏',
  reddit: '🔴',
  facebook: '📘',
  instagram: '📸',
  linkedin: '💼',
};

const sourceColors: Record<string, string> = {
  twitter: 'bg-foreground/10',
  reddit: 'bg-orange-500/10 text-orange-400',
  facebook: 'bg-blue-500/10 text-blue-400',
  instagram: 'bg-pink-500/10 text-pink-400',
  linkedin: 'bg-blue-600/10 text-blue-500',
};

const filterOptions: { value: SentimentType | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-muted text-foreground' },
  { value: 'positive', label: 'Positive', color: 'bg-sentiment-positive/10 text-sentiment-positive' },
  { value: 'neutral', label: 'Neutral', color: 'bg-sentiment-neutral/10 text-sentiment-neutral' },
  { value: 'negative', label: 'Negative', color: 'bg-sentiment-negative/10 text-sentiment-negative' },
];

export function PostFeed({ posts, currentFilter, onFilterChange, className }: PostFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('rounded-xl border border-border bg-card', className)}
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Recent Posts</h3>
            <p className="text-sm text-muted-foreground">
              Latest social mentions with AI sentiment analysis
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                currentFilter === option.value
                  ? option.color + ' ring-2 ring-offset-2 ring-offset-card ring-primary/50'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                  {post.author.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-sm">{post.author.name}</span>
                  <span className="text-muted-foreground text-sm">{post.author.handle}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    sourceColors[post.source]
                  )}>
                    {sourceIcons[post.source]} {post.source}
                  </span>
                  <span className="text-muted-foreground text-xs ml-auto">
                    {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mb-2 leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center gap-4">
                  <SentimentBadge sentiment={post.sentiment} size="sm" />
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                    {post.keyword}
                  </span>
                  <div className="flex items-center gap-3 ml-auto text-muted-foreground">
                    <span className="flex items-center gap-1 text-xs">
                      <Heart className="w-3.5 h-3.5" />
                      {post.engagement.likes}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <Share2 className="w-3.5 h-3.5" />
                      {post.engagement.shares}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.engagement.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
