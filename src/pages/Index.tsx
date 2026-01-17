import { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { SentimentChart } from '@/components/SentimentChart';
import { SentimentDonut } from '@/components/SentimentDonut';
import { PostFeed } from '@/components/PostFeed';
import { KeywordManager } from '@/components/KeywordManager';
import { TrendAlert } from '@/components/TrendAlert';
import { ResponseDialog } from '@/components/ResponseDialog';
import { generateMockPosts, generateTrendData, defaultKeywords } from '@/data/mockData';
import { SocialPost, TrackedKeyword, SentimentStats, SentimentType } from '@/types/social';
import { Activity, TrendingUp, TrendingDown, Minus, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [trendData, setTrendData] = useState(generateTrendData(24));
  const [keywords, setKeywords] = useState<TrackedKeyword[]>(defaultKeywords);
  const [showAlert, setShowAlert] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const postFeedRef = useRef<HTMLDivElement>(null);
  
  const { analyzePosts, isAnalyzing } = useSentimentAnalysis();

  useEffect(() => {
    // Initial load
    setPosts(generateMockPosts(50));
  }, []);

  const handleAnalyzeWithAI = async () => {
    const postsToAnalyze = posts.map((p) => ({ id: p.id, content: p.content }));
    const results = await analyzePosts(postsToAnalyze);
    
    if (results) {
      setPosts((prev) =>
        prev.map((post) => {
          const result = results[post.id];
          if (result) {
            return {
              ...post,
              sentiment: result.sentiment,
              confidenceScore: result.confidenceScore,
            };
          }
          return post;
        })
      );
    }
  };

  const stats: SentimentStats = useMemo(() => {
    const positive = posts.filter((p) => p.sentiment === 'positive').length;
    const neutral = posts.filter((p) => p.sentiment === 'neutral').length;
    const negative = posts.filter((p) => p.sentiment === 'negative').length;
    return { positive, neutral, negative, total: posts.length };
  }, [posts]);

  const negativePercentage = stats.total > 0 ? (stats.negative / stats.total) * 100 : 0;

  const filteredPosts = useMemo(() => {
    if (sentimentFilter === 'all') return posts;
    return posts.filter((p) => p.sentiment === sentimentFilter);
  }, [posts, sentimentFilter]);

  const handleViewNegativePosts = () => {
    setSentimentFilter('negative');
    postFeedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddKeyword = (keyword: string) => {
    const newKeyword: TrackedKeyword = {
      id: `kw-${Date.now()}`,
      keyword,
      isActive: true,
      createdAt: new Date(),
    };
    setKeywords((prev) => [...prev, newKeyword]);
  };

  const handleRemoveKeyword = (id: string) => {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  };

  const handleToggleKeyword = (id: string) => {
    setKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isActive: !k.isActive } : k))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Alert Section */}
        <TrendAlert
          isVisible={showAlert && negativePercentage > 20}
          negativePercentage={negativePercentage}
          onDismiss={() => setShowAlert(false)}
          onViewNegativePosts={handleViewNegativePosts}
          onCreateResponse={() => setShowResponseDialog(true)}
          className="mb-6"
        />
        
        {/* Response Dialog */}
        <ResponseDialog
          isOpen={showResponseDialog}
          onClose={() => setShowResponseDialog(false)}
        />

        {/* Stats Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sentiment Overview</h2>
          <Button
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <Brain className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            title="Total Mentions"
            value={stats.total}
            subtitle="Last 24 hours"
            icon={Activity}
            trend={{ value: 12, isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Positive"
            value={stats.positive}
            subtitle={`${((stats.positive / stats.total) * 100 || 0).toFixed(1)}% of total`}
            icon={TrendingUp}
            variant="positive"
          />
          <StatCard
            title="Neutral"
            value={stats.neutral}
            subtitle={`${((stats.neutral / stats.total) * 100 || 0).toFixed(1)}% of total`}
            icon={Minus}
            variant="neutral"
          />
          <StatCard
            title="Negative"
            value={stats.negative}
            subtitle={`${((stats.negative / stats.total) * 100 || 0).toFixed(1)}% of total`}
            icon={TrendingDown}
            trend={{ value: 8, isPositive: false }}
            variant="negative"
          />
        </motion.div>

        {/* Charts and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <SentimentChart data={trendData} className="lg:col-span-2" />
          <SentimentDonut stats={stats} />
        </div>

        {/* Posts and Keywords */}
        <div ref={postFeedRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PostFeed
            posts={filteredPosts.slice(0, 20)}
            currentFilter={sentimentFilter}
            onFilterChange={setSentimentFilter}
            className="lg:col-span-2"
          />
          <div className="space-y-6">
            <KeywordManager
              keywords={keywords}
              onAdd={handleAddKeyword}
              onRemove={handleRemoveKeyword}
              onToggle={handleToggleKeyword}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Updates</h3>
                  <p className="text-sm text-muted-foreground">Auto-refresh enabled</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                New posts are automatically analyzed and displayed. The dashboard updates
                every 8 seconds with fresh sentiment data.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="text-sm text-primary font-medium">Live</span>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
