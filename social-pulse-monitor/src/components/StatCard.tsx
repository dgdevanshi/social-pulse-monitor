import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'positive' | 'neutral' | 'negative' | 'primary';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  positive: 'bg-card border-sentiment-positive/30',
  neutral: 'bg-card border-sentiment-neutral/30',
  negative: 'bg-card border-sentiment-negative/30',
  primary: 'bg-card border-primary/30',
};

const iconVariantStyles = {
  default: 'text-muted-foreground bg-muted',
  positive: 'text-sentiment-positive bg-sentiment-positive/10',
  neutral: 'text-sentiment-neutral bg-sentiment-neutral/10',
  negative: 'text-sentiment-negative bg-sentiment-negative/10',
  primary: 'text-primary bg-primary/10',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border p-6 transition-all duration-200 hover:shadow-lg',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-sentiment-positive' : 'text-sentiment-negative'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconVariantStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
