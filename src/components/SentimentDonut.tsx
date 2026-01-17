import { SentimentStats } from '@/types/social';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface SentimentDonutProps {
  stats: SentimentStats;
  className?: string;
}

const COLORS = {
  positive: 'hsl(142, 71%, 45%)',
  neutral: 'hsl(38, 92%, 50%)',
  negative: 'hsl(0, 84%, 60%)',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm px-3 py-2 shadow-xl">
        <p className="text-sm font-medium capitalize">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function SentimentDonut({ stats, className }: SentimentDonutProps) {
  const data = [
    { name: 'positive', value: stats.positive },
    { name: 'neutral', value: stats.neutral },
    { name: 'negative', value: stats.negative },
  ];

  const positivePercent = ((stats.positive / stats.total) * 100).toFixed(1);
  const negativePercent = ((stats.negative / stats.total) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Sentiment Distribution</h3>
          <p className="text-sm text-muted-foreground">Overall breakdown</p>
        </div>
        <div className="relative h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-sentiment-positive/10">
            <p className="text-lg font-semibold text-sentiment-positive">{positivePercent}%</p>
            <p className="text-xs text-muted-foreground">Positive</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-sentiment-neutral/10">
            <p className="text-lg font-semibold text-sentiment-neutral">
              {((stats.neutral / stats.total) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Neutral</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-sentiment-negative/10">
            <p className="text-lg font-semibold text-sentiment-negative">{negativePercent}%</p>
            <p className="text-xs text-muted-foreground">Negative</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
