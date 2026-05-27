import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function PerformanceChart() {
  const { data } = useQuery({
    queryKey: ['performance'],
    queryFn: () => statsApi.getPerformance(30).then((res) => res.data),
  });

  const chartData = data?.daily || [
    { date: 'Mon', views: 1200, likes: 340, shares: 120 },
    { date: 'Tue', views: 1900, likes: 520, shares: 200 },
    { date: 'Wed', views: 2400, likes: 680, shares: 280 },
    { date: 'Thu', views: 1800, likes: 450, shares: 150 },
    { date: 'Fri', views: 3200, likes: 890, shares: 420 },
    { date: 'Sat', views: 4100, likes: 1200, shares: 580 },
    { date: 'Sun', views: 3800, likes: 1100, shares: 490 },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Performance Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Views, likes, and shares over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorViews)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="likes"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorLikes)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="shares"
              stroke="#f59e0b"
              fill="transparent"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}