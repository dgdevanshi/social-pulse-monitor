import { TrendDataPoint } from '@/types/social';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface SentimentChartProps {
  data: TrendDataPoint[];
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0]?.payload?.timestamp) {
    return (
      <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-2">
          {format(new Date(payload[0].payload.timestamp), 'MMM d, h:mm a')}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function SentimentChart({ data, className }: SentimentChartProps) {
  const formattedData = data.map(d => ({
    ...d,
    timestamp: d.timestamp,
    formattedTime: format(new Date(d.timestamp), 'ha'),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Sentiment Trends</h3>
          <p className="text-sm text-muted-foreground">Last 24 hours activity</p>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis
                dataKey="formattedTime"
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground capitalize">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="positive"
                stroke="hsl(142, 71%, 45%)"
                fill="url(#positiveGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stroke="hsl(38, 92%, 50%)"
                fill="url(#neutralGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="negative"
                stroke="hsl(0, 84%, 60%)"
                fill="url(#negativeGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
