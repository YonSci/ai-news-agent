import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useDashboardStore } from '@/store/useDashboardStore';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const { sidebarOpen } = useDashboardStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <TopBar />
      
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarOpen ? 'pl-64' : 'pl-16'
        )}
      >
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}