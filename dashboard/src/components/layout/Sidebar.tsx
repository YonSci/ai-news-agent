import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ClipboardList, 
  FolderKanban, 
  Calendar, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'News Signals', path: '/trending', icon: TrendingUp },
  { name: 'News Queue', path: '/workflow', icon: ClipboardList },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Coverage Calendar', path: '/calendar', icon: Calendar },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, setCurrentPage } = useDashboardStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-lg font-bold text-foreground">AI News Traker</span>
          </div>
        ) : (
          <Sparkles className="w-6 h-6 text-purple-500 mx-auto" />
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setCurrentPage(item.name.toLowerCase())}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive 
                  ? 'bg-purple-600/15 text-purple-500 border border-purple-600/30' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={20} />
              {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      {sidebarOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Agent Active</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Monitoring free public sources
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}