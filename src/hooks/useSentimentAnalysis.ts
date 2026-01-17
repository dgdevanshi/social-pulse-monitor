import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SentimentType } from '@/types/social';
import { toast } from 'sonner';

interface SentimentResult {
  sentiment: SentimentType;
  confidenceScore: number;
}

interface AnalysisState {
  isAnalyzing: boolean;
  error: string | null;
  lastAnalyzedCount: number;
}

export function useSentimentAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    error: null,
    lastAnalyzedCount: 0,
  });

  const analyzePosts = useCallback(
    async (
      posts: Array<{ id: string; content: string }>
    ): Promise<Record<string, SentimentResult> | null> => {
      if (posts.length === 0) return null;

      setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

      try {
        // Batch posts in groups of 10 for efficiency
        const batchSize = 10;
        const allResults: Record<string, SentimentResult> = {};

        for (let i = 0; i < posts.length; i += batchSize) {
          const batch = posts.slice(i, i + batchSize);
          
          const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
            body: { posts: batch },
          });

          if (error) {
            console.error('Sentiment analysis error:', error);
            throw new Error(error.message || 'Failed to analyze sentiment');
          }

          if (data?.error) {
            throw new Error(data.error);
          }

          if (data?.sentiments) {
            Object.assign(allResults, data.sentiments);
          }
        }

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          lastAnalyzedCount: Object.keys(allResults).length,
        }));

        toast.success(`Analyzed ${Object.keys(allResults).length} posts with AI`);
        return allResults;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Sentiment analysis failed:', message);
        
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: message,
        }));

        if (message.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (message.includes('Payment required')) {
          toast.error('AI credits depleted. Please add funds to continue.');
        } else {
          toast.error('Failed to analyze sentiment. Using fallback analysis.');
        }

        return null;
      }
    },
    []
  );

  return {
    analyzePosts,
    isAnalyzing: state.isAnalyzing,
    error: state.error,
    lastAnalyzedCount: state.lastAnalyzedCount,
  };
}
