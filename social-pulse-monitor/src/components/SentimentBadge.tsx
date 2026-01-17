import { SentimentType } from '@/types/social';
import { cn } from '@/lib/utils';
import { TrendingUp, Minus, TrendingDown } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: SentimentType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sentimentConfig = {
  positive: {
    label: 'Positive',
    icon: TrendingUp,
    className: 'sentiment-positive',
  },
  neutral: {
    label: 'Neutral',
    icon: Minus,
    className: 'sentiment-neutral',
  },
  negative: {
    label: 'Negative',
    icon: TrendingDown,
    className: 'sentiment-negative',
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
};

export function SentimentBadge({ 
  sentiment, 
  showIcon = true, 
  size = 'md',
  className 
}: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;
  
  return (
    <span 
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(
        size === 'sm' && 'w-3 h-3',
        size === 'md' && 'w-4 h-4',
        size === 'lg' && 'w-5 h-5',
      )} />}
      {config.label}
    </span>
  );
}
