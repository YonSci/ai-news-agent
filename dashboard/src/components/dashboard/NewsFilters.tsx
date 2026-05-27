import { Search, Funnel, CalendarDays, MapPin, Shapes } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REGION_OPTIONS, TOPIC_OPTIONS } from '@/lib/news-filters';

export interface NewsFilterValues {
  topic: string;
  region: string;
  startDate: string;
  endDate: string;
  q: string;
}

interface NewsFiltersProps {
  value: NewsFilterValues;
  onChange: (value: NewsFilterValues) => void;
  onSearch: () => void;
  onQuickSearch: (keyword: string) => void;
}

const QUICK_SEARCHES = ['AI', 'OpenAI', 'Anthropic', 'Claude', 'Gemini', 'Cursor'];

export function NewsFilters({ value, onChange, onSearch, onQuickSearch }: NewsFiltersProps) {
  const patchValue = (partial: Partial<NewsFilterValues>) => onChange({ ...value, ...partial });

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.12)]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
            <Funnel size={18} />
          </div>
          <div>
            <CardTitle className="text-foreground">News Filters</CardTitle>
            <p className="text-sm text-muted-foreground">Query all active free public sources by topic, region, date, and keywords.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Topic/Interest</label>
            <Select value={value.topic} onValueChange={(topic) => patchValue({ topic })}>
              <SelectTrigger className="h-11 w-full border-amber-400/30 bg-background text-foreground">
                <div className="flex items-center gap-2">
                  <Shapes size={16} className="text-amber-400" />
                  <SelectValue placeholder="Choose topic" />
                </div>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Region</label>
            <Select value={value.region} onValueChange={(region) => patchValue({ region })}>
              <SelectTrigger className="h-11 w-full border-amber-400/30 bg-background text-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-amber-400" />
                  <SelectValue placeholder="Choose region" />
                </div>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Start Date</label>
            <div className="relative">
              <Input
                type="date"
                value={value.startDate}
                onChange={(event) => patchValue({ startDate: event.target.value })}
                className="h-11 border-amber-400/30 bg-background pr-11 text-foreground"
              />
              <CalendarDays className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-amber-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">End Date</label>
            <div className="relative">
              <Input
                type="date"
                value={value.endDate}
                onChange={(event) => patchValue({ endDate: event.target.value })}
                className="h-11 border-amber-400/30 bg-background pr-11 text-foreground"
              />
              <CalendarDays className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Search Keywords</label>
          <div className="flex flex-col gap-3 lg:flex-row">
            <Input
              value={value.q}
              onChange={(event) => patchValue({ q: event.target.value })}
              placeholder="AI"
              className="h-12 border-amber-400/30 bg-background text-base text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              size="lg"
              className="h-12 min-w-36 bg-amber-500 text-primary-foreground hover:bg-amber-400"
              onClick={onSearch}
            >
              <Search size={18} className="mr-2" /> Search
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Quick searches:</span>
          {QUICK_SEARCHES.map((keyword) => (
            <Button
              key={keyword}
              type="button"
              variant="outline"
              className="h-9 border-amber-400/40 bg-background text-foreground hover:bg-amber-500/10"
              onClick={() => onQuickSearch(keyword)}
            >
              {keyword}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}