import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Goal, HandHeart, Mail, MonitorSmartphone, Rocket, UserRound, Wrench } from 'lucide-react';

const techStack = [
  'Frontend: React + TypeScript + Vite',
  'UI: Tailwind CSS + shadcn/ui',
  'State and data: Zustand + TanStack Query',
  'Backend API: Flask + Python',
  'Data storage: SQLite (persistent volume in production)',
  'Deployment: Netlify (frontend) + Railway (backend)',
];

const usageSteps = [
  'Open Dashboard to track live story volume and relevance.',
  'Use News Filters to narrow by topic, region, dates, and keywords.',
  'Review Live AI News Feed and triage stories as tracked, important, or ignored.',
  'Use News Signals and News Queue for planning and prioritization.',
  'Check the backend hydration health status to confirm data reliability.',
];

const credits = [
  'Free public AI sources: company news pages, RSS feeds, Hacker News, and GitHub releases.',
  'Open-source libraries and tools used across the stack.',
  'Project owner and contributors maintaining ingestion, quality, and dashboard UX.',
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
          AI News Traker Agent is a production-oriented monitoring dashboard for AI news discovery, prioritization, and planning.
          It helps teams quickly turn high-signal updates into actionable content and project decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Goal size={18} className="text-emerald-400" /> Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Deliver a reliable single-pane view of AI developments so you can monitor what matters, reduce noise,
            and respond faster to meaningful changes across major AI ecosystems.
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <HandHeart size={18} className="text-cyan-400" /> Purpose
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This dashboard is built to support editorial planning, content workflows, and ongoing AI market awareness
            using only free/public data sources with a practical triage system.
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen size={18} className="text-amber-400" /> How To Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {usageSteps.map((step, idx) => (
            <div key={step} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-foreground">
                {idx + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wrench size={18} className="text-purple-400" /> Technology Used
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
            <MonitorSmartphone size={18} className="text-blue-400" /> Dashboard Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The dashboard is designed for continuous monitoring and curation. It emphasizes relevance scoring,
            source tracking, workflow movement, and operational reliability in production environments.
          </p>
          <Separator />
          <p>
            Data quality and uptime are supported with backend hydration checks and storage persistence safeguards
            to reduce empty-state incidents after deploys or restarts.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Rocket size={18} className="text-rose-400" /> Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {credits.map((item) => (
            <p key={item}>{item}</p>
          ))}
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
