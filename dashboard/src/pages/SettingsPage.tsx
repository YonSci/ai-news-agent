import { usePreferencesStore } from '@/store/usePreferencesStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { REGION_OPTIONS, TOPIC_OPTIONS } from '@/lib/news-filters';
import {
  getCurrentApiBaseUrl,
  getCurrentGitHubToken,
  getSuggestedLocalApiBaseUrl,
  getSuggestedProductionApiBaseUrl,
  resetApiBaseUrlToDefault,
  setApiBaseUrl,
  setGitHubToken,
} from '@/lib/api';
import { toast } from 'sonner';

export function SettingsPage() {
  const refreshIntervalMinutes = usePreferencesStore((state) => state.refreshIntervalMinutes);
  const defaultRegion = usePreferencesStore((state) => state.defaultRegion);
  const defaultTopic = usePreferencesStore((state) => state.defaultTopic);
  const setRefreshIntervalMinutes = usePreferencesStore((state) => state.setRefreshIntervalMinutes);
  const setDefaultRegion = usePreferencesStore((state) => state.setDefaultRegion);
  const setDefaultTopic = usePreferencesStore((state) => state.setDefaultTopic);

  const [apiUrl, setApiUrlState] = useState(getCurrentApiBaseUrl());
  const [githubToken, setGithubTokenState] = useState(getCurrentGitHubToken());

  const localApiUrl = getSuggestedLocalApiBaseUrl();
  const productionApiUrl = getSuggestedProductionApiBaseUrl();

  const handleSaveConnectionSettings = () => {
    const appliedApiUrl = setApiBaseUrl(apiUrl);
    setGitHubToken(githubToken);
    setApiUrlState(appliedApiUrl);
    toast.success('Connection settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure source coverage and dashboard behavior</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Dashboard API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Backend API URL</label>
            <Input
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              className="bg-background border-border text-foreground"
            />
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApiUrlState(localApiUrl)}
              >
                Use Local Backend
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApiUrlState(productionApiUrl)}
              >
                Use Production Backend
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const restored = resetApiBaseUrlToDefault();
                  setApiUrlState(restored);
                  toast.success('API URL reset to default');
                }}
              >
                Reset Default
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Local default: {localApiUrl} | Production default: {productionApiUrl}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Optional GitHub Token</label>
            <Input
              type="password"
              placeholder="ghp_..."
              value={githubToken}
              onChange={(e) => setGithubTokenState(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            GitHub release feeds work without a token. A token only improves API-based enrichment.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveConnectionSettings}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Dashboard Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Default Topic</label>
            <Select value={defaultTopic} onValueChange={setDefaultTopic}>
              <SelectTrigger className="bg-background border-border text-foreground w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOPIC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Default Region</label>
            <Select value={defaultRegion} onValueChange={setDefaultRegion}>
              <SelectTrigger className="bg-background border-border text-foreground w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Refresh Interval (minutes)</label>
            <Input
              type="number"
              value={refreshIntervalMinutes}
              onChange={(e) => setRefreshIntervalMinutes(Number(e.target.value) || 15)}
              className="bg-background border-border text-foreground w-40"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            RSS, company pages, Hacker News, and GitHub release feeds use this cadence on the dashboard.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => toast.success('Dashboard preferences saved')}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
