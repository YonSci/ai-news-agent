import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
        <p className="text-slate-400 mt-1">Schedule and plan your content publishing</p>
      </div>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Calendar size={48} className="mb-4 text-slate-700" />
          <p className="text-lg font-medium text-slate-400">Calendar View</p>
          <p className="text-sm mt-1">Coming soon — drag content to schedule publishing dates</p>
        </CardContent>
      </Card>
    </div>
  );
}
