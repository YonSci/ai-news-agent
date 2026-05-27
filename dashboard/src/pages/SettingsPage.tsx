import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your AI News Agent</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-400">Backend API URL</label>
            <Input
              defaultValue="http://localhost:5000/api"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-400">Anthropic API Key</label>
            <Input
              type="password"
              placeholder="sk-ant-..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600"
            />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Agent Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-400">Scan Interval (minutes)</label>
            <Input
              type="number"
              defaultValue={60}
              className="bg-slate-800 border-slate-700 text-white w-40"
            />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">Save Schedule</Button>
        </CardContent>
      </Card>
    </div>
  );
}
