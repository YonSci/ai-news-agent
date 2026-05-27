import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from 'recharts';
import type { TrendingTopic } from '@/types';

interface Props {
  topics: TrendingTopic[];
}

export function TrendingHeatmap({ topics }: Props) {
  const data = useMemo(() => {
    return topics.map((topic) => ({
      x: topic.volume,
      y: topic.growth,
      z: Math.abs(topic.growth) * 10,
      name: topic.keyword,
      category: topic.category,
      sentiment: topic.sentiment,
    }));
  }, [topics]);

  const getColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#22c55e';
      case 'negative': return '#ef4444';
      default: return '#eab308';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          type="number"
          dataKey="x"
          name="Volume"
          stroke="#64748b"
          fontSize={12}
          label={{ value: 'Search Volume', position: 'bottom', fill: '#64748b' }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Growth %"
          stroke="#64748b"
          fontSize={12}
          label={{ value: 'Growth %', angle: -90, position: 'left', fill: '#64748b' }}
        />
        <ZAxis type="number" dataKey="z" range={[50, 400]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
                  <p className="font-semibold text-foreground">{data.name}</p>
                  <p className="text-sm text-muted-foreground">{data.category}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-muted-foreground">Volume: {data.x.toLocaleString()}</p>
                    <p className="text-muted-foreground">Growth: {data.y > 0 ? '+' : ''}{data.y}%</p>
                    <p className="text-muted-foreground">
                      Sentiment:{' '}
                      <span style={{ color: getColor(data.sentiment) }}>
                        {data.sentiment}
                      </span>
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Scatter name="Topics" data={data} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.sentiment)} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}