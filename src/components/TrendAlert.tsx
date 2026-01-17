import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TrendAlertProps {
  isVisible: boolean;
  negativePercentage: number;
  onDismiss: () => void;
  onViewNegativePosts: () => void;
  onCreateResponse: () => void;
  className?: string;
}

export function TrendAlert({
  isVisible,
  negativePercentage,
  onDismiss,
  onViewNegativePosts,
  onCreateResponse,
  className,
}: TrendAlertProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={cn(
            'rounded-xl border border-sentiment-negative/50 bg-sentiment-negative/10 p-4',
            className
          )}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-sentiment-negative/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5 text-sentiment-negative" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sentiment-negative">
                  Negative Sentiment Spike Detected
                </h4>
                <TrendingDown className="w-4 h-4 text-sentiment-negative" />
              </div>
              <p className="text-sm text-foreground/80 mb-3">
                Negative sentiment has increased to{' '}
                <span className="font-semibold text-sentiment-negative">
                  {negativePercentage.toFixed(1)}%
                </span>{' '}
                in the last 4 hours. Consider reviewing recent posts and preparing a response.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs"
                  onClick={onViewNegativePosts}
                >
                  View Negative Posts
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-sentiment-negative/30 hover:bg-sentiment-negative/10"
                  onClick={onCreateResponse}
                >
                  Create Response
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
