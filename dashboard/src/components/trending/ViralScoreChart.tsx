import type { TrendingTopic } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  topics: TrendingTopic[];
}

export function ViralScoreChart({ topics }: Props) {
  const data = topics.slice(0, 8).map((t) => ({
    name: t.keyword.length > 12 ? t.keyword.slice(0, 12) + '…' : t.keyword,
    growth: t.growth,
  }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
        <YAxis stroke="#64748b" fontSize={10} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="growth" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Trend Change %" />
      </BarChart>
    </ResponsiveContainer>
  );
}
