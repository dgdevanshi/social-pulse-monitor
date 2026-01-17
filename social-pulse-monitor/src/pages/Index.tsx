import { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { SentimentChart } from '@/components/SentimentChart';
import { SentimentDonut } from '@/components/SentimentDonut';
import { PostFeed } from '@/components/PostFeed';
import { KeywordManager } from '@/components/KeywordManager';
import { TrendAlert } from '@/components/TrendAlert';
import { ResponseDialog } from '@/components/ResponseDialog';
import { SocialPost, TrackedKeyword, SentimentStats, SentimentType } from '@/types/social';
import { Activity, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '@/services/api';

const Index = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [showAlert, setShowAlert] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const postFeedRef = useRef<HTMLDivElement>(null);

  // Convert backend post to frontend format
  const convertPost = (backendPost: api.Post): SocialPost => ({
    id: `post-${backendPost.id}`,
    text: backendPost.text,
    sentiment: (backendPost.sentiment_label?.toLowerCase() as SentimentType) || 'neutral',
    confidence: backendPost.sentiment_score || 0,
    timestamp: new Date(backendPost.timestamp),
    source: backendPost.source,
    keywords: backendPost.keyword_matched ? [backendPost.keyword_matched] : [],
  });

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load keywords
        const keywordsData = await api.fetchKeywords();
        setKeywords(
          keywordsData.map((kw) => ({
            id: `kw-${kw.id}`,
            keyword: kw.keyword,
            isActive: true,
            createdAt: new Date(kw.created_at),
          }))
        );

        // Load recent posts
        const recentPosts = await api.fetchRecentPosts();
        setPosts(recentPosts.map(convertPost));

        // Load trend data
        const trends = await api.fetchTrends(24);
        setTrendData(
          trends.map((t) => ({
            time: new Date(t.hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            positive: t.positive,
            neutral: t.neutral,
            negative: t.negative,
          }))
        );
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Set up SSE for real-time updates
  useEffect(() => {
    const eventSource = api.createEventSource();

    eventSource.onopen = () => {
      console.log('SSE connection established');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received new post:', data);

        // Convert the processed post to our format
        const newPost: SocialPost = {
          id: `post-${data.post_id}`,
          text: data.text,
          sentiment: data.sentiment.toLowerCase() as SentimentType,
          confidence: data.confidence,
          timestamp: new Date(data.timestamp),
          source: data.source,
          keywords: [data.keyword_matched],
        };

        // Add to posts (keep last 50)
        setPosts((prev) => [newPost, ...prev.slice(0, 49)]);

        // Refresh stats periodically
        api.fetchDashboardStats();
      } catch (error) {
        console.error('Error processing SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

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

  const handleAddKeyword = async (keyword: string) => {
    try {
      const result = await api.addKeyword(keyword);
      const newKeyword: TrackedKeyword = {
        id: `kw-${result.keyword_id}`,
        keyword: result.keyword,
        isActive: true,
        createdAt: new Date(),
      };
      setKeywords((prev) => [...prev, newKeyword]);
    } catch (error) {
      console.error('Error adding keyword:', error);
    }
  };

  const handleRemoveKeyword = async (id: string) => {
    try {
      const keywordId = parseInt(id.replace('kw-', ''));
      await api.deleteKeyword(keywordId);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch (error) {
      console.error('Error removing keyword:', error);
    }
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
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected via SSE' : 'Connecting...'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                New posts are automatically analyzed using AI sentiment analysis. The dashboard
                updates in real-time as posts are processed.
              </p>
              <div className="mt-4 flex items-center gap-2">
                {isConnected ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="text-sm text-primary font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-muted"></span>
                    <span className="text-sm text-muted-foreground font-medium">Offline</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
