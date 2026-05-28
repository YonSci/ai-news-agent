import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Mail, MonitorSmartphone, Rocket, UserRound, Wrench } from 'lucide-react';

const featureItems = [
  {
    title: 'Interactive Charts',
    detail: 'Visualize news trends with pie charts, bar graphs, and timeline analytics.',
  },
  {
    title: 'AI Summaries',
    detail: 'Get concise AI-powered summaries of articles using advanced language models.',
  },
  {
    title: 'Global Coverage',
    detail: 'Access news from multiple regions and filter by country, topic, and date range.',
  },
  {
    title: 'Smart Filtering',
    detail: 'Advanced search and filtering capabilities to find exactly what you need.',
  },
];

const trackedRepos = [
  'anthropics/claude-code',
  'openai/codex',
  'getcursor/cursor',
  'paul-gauthier/aider',
  'cline/cline',
  'continuedev/continue',
  'google-gemini/gemini-cli',
];

const rssFeeds = [
  'Anthropic News (scraped from anthropic.com/news)',
  'OpenAI News',
  'Google AI Blog (DeepMind)',
  'TechCrunch AI',
  'The Verge AI',
  'Ars Technica AI',
  'VentureBeat AI',
];

const techStack = [
  'Next.js, React, and TypeScript for the modern dashboard experience.',
  'Flask + Python backend APIs for aggregation and delivery.',
  'SQLite storage with persistent deployment volumes.',
  'TanStack Query, Zustand, and shadcn/ui for data/state/UI flow.',
  'Netlify frontend deployment with Railway backend deployment.',
];

export function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300">
            About
          </Badge>
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300">
            AI News Traker Agent
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground">About This Dashboard</h1>
        <p className="text-muted-foreground max-w-3xl">
          A real-time dashboard tracking AI news from Anthropic, OpenAI, Google Gemini, and popular AI CLI tools.
          Aggregates content from Hacker News, GitHub Releases, and RSS feeds from free, public data sources with no API keys required.
          A modern, AI-powered news dashboard built with Next.js, React, and TypeScript.
        </p>
        <p className="text-muted-foreground max-w-3xl">
          Visualize, filter, and personalize news from global sources with advanced analytics and summaries.
          Stay informed with AI-powered news insights, interactive visualizations, and personalized content from around the world.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen size={18} className="text-amber-400" /> Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            HN Top 500 stories filtered by AI keywords (claude, openai, gemini, chatgpt, copilot, llm, agentic, etc.) via the Firebase API.
          </p>
          <div>
            <p className="text-foreground font-medium mb-2">GitHub Releases tracked repositories:</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {trackedRepos.map((repo) => (
                <div key={repo} className="rounded-md border border-border bg-muted/20 px-3 py-2">
                  {repo}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-foreground font-medium mb-2">RSS Feeds:</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {rssFeeds.map((feed) => (
                <div key={feed} className="rounded-md border border-border bg-muted/20 px-3 py-2">
                  {feed}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Rocket size={18} className="text-rose-400" /> Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {featureItems.map((item) => (
            <div key={item.title} className="rounded-md border border-border bg-muted/20 px-3 py-2">
              <p className="text-foreground font-medium">{item.title}</p>
              <p>{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MonitorSmartphone size={18} className="text-blue-400" /> How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The platform continuously aggregates public AI news signals from Hacker News, GitHub releases, and curated RSS sources,
            deduplicates results, ranks relevance, and presents them in a real-time dashboard for monitoring and decision support.
          </p>
          <Separator />
          <p>
            Users can filter by topic, region, date range, and keywords to focus on high-value updates while interactive visualizations
            highlight momentum and theme shifts.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen size={18} className="text-amber-400" /> Local Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Start backend API server.</p>
          <p>2. Start dashboard frontend in development mode.</p>
          <p>3. Open the app and configure filters, refresh cadence, and integrations.</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wrench size={18} className="text-purple-400" /> Tech Stack
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {techStack.map((item) => (
            <div key={item} className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Rocket size={18} className="text-rose-400" /> License
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Refer to the repository license for terms and usage permissions.
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UserRound size={18} className="text-emerald-400" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="text-foreground font-medium">Contact Person: Yonas Mersha</p>
          <p>AI Expert, International Livestock Research Institute (ILRI)</p>
          <p>
            LinkedIn profile:{' '}
            <a
              href="https://linkedin.com/in/yonas-mersha-baab561b5"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              linkedin.com/in/yonas-mersha-baab561b5
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Mail size={14} className="text-amber-400" />
            <a href="mailto:yonas.mersha14@gmail.com" className="text-cyan-400 hover:text-cyan-300 underline">
              yonas.mersha14@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
