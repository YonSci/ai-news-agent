import { Search, Bell, Moon, Sun, User, CheckCheck, Settings, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDashboardStore } from '@/store/useDashboardStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const navigate = useNavigate();
  const {
    sidebarOpen,
    notifications,
    theme,
    setTheme,
    dismissNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useDashboardStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-card/95 backdrop-blur border-b border-border z-30 transition-all duration-300 ${
        sidebarOpen ? 'left-64' : 'left-16'
      }`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search news, companies, topics, projects..."
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="px-2 py-1.5 flex items-center justify-between gap-2">
                <DropdownMenuLabel className="p-0 text-foreground">Notifications</DropdownMenuLabel>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={markAllNotificationsRead}
                    className="h-6 text-xs"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />

              {notifications.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No notifications yet.
                </div>
              ) : (
                <div className="max-h-80 overflow-auto p-1 space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-md border px-2 py-2 ${
                        notification.read ? 'bg-background border-border' : 'bg-accent/40 border-accent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{formatTimestamp(notification.timestamp)}</p>
                        </div>
                        {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="xs"
                            className="h-6 text-xs"
                            onClick={() => markNotificationRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-6 text-xs text-destructive hover:text-destructive"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={clearNotifications}
                    >
                      <Trash2 size={14} />
                      Clear all notifications
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 flex items-center gap-2 pl-3 border-l border-border">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm text-muted-foreground hidden md:block">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast.info('Profile settings are coming soon.')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                <Settings size={14} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                Toggle theme
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => toast.info('Logout is not connected yet.')}
              >
                <LogOut size={14} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}