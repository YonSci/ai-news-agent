import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function TopBar() {
  const { sidebarOpen, notifications, theme, setTheme } = useDashboardStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-30 transition-all duration-300 ${
        sidebarOpen ? 'left-64' : 'left-16'
      }`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search content, topics, projects..."
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="text-slate-400 hover:text-white"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-white"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </Button>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm text-slate-300 hidden md:block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}