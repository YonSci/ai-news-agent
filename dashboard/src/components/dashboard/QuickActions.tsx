import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileText, Zap, RefreshCw } from 'lucide-react';

const actions = [
  { label: 'Scan Trending', icon: Search, description: 'Find new trending topics', className: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'Generate Script', icon: FileText, description: 'AI-write a video script', className: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Boost Content', icon: Zap, description: 'Optimize for virality', className: 'bg-yellow-600 hover:bg-yellow-700' },
  { label: 'Sync Pipeline', icon: RefreshCw, description: 'Refresh all data', className: 'bg-green-600 hover:bg-green-700' },
];

export function QuickActions() {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                className={`${action.className} flex flex-col h-auto py-4 gap-2`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{action.label}</span>
                <span className="text-[10px] opacity-80">{action.description}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
