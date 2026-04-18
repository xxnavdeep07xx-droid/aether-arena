'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore, useAuthStore, useSearchStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Search, Bell, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { timeAgo } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export function TopBar() {
  const { currentView } = useAppStore();
  const { user } = useAuthStore();
  const { query, setQuery } = useSearchStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentView === 'landing') return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.notifications?.filter((n: Notification) => !n.isRead).length || 0);
        }
      } catch {
        // Silently fail
      }
    };
    fetchNotifications();
  }, [currentView]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (currentView === 'landing') return null;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'tournament': return '🏆';
      case 'payment': return '💰';
      case 'result': return '🎯';
      case 'announcement': return '📢';
      default: return '🔔';
    }
  };

  return (
    <header className="fixed top-0 left-[72px] right-0 h-16 bg-arena-surface/80 backdrop-blur-md border-b border-arena-border z-40 flex items-center px-4 md:px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tournaments, players..."
            className="pl-9 h-10 bg-arena-card border-arena-border rounded-xl text-sm text-arena-text-primary placeholder:text-arena-text-muted focus:border-arena-accent focus:ring-arena-accent/20"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-text-muted hover:text-arena-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 ml-4">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-arena-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-arena-card border border-arena-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-arena-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-arena-text-primary">Notifications</h3>
                <Badge variant="secondary" className="bg-arena-accent/20 text-arena-accent text-[10px]">
                  {unreadCount} new
                </Badge>
              </div>
              <ScrollArea className="max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-arena-text-muted">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y divide-arena-border">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => setShowNotifications(false)}
                        className={cn(
                          'w-full p-3 text-left hover:bg-arena-surface transition-colors',
                          !notif.isRead && 'bg-arena-accent/5'
                        )}
                      >
                        <div className="flex gap-3">
                          <span className="text-lg shrink-0">{getNotifIcon(notif.type)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-arena-text-primary truncate">
                              {notif.title}
                            </p>
                            <p className="text-xs text-arena-text-secondary mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-arena-text-muted mt-1">
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-arena-accent shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 h-10 px-2 rounded-xl hover:bg-arena-card transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-7 h-7 rounded-full object-cover border border-arena-border"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-arena-accent/20 flex items-center justify-center text-xs font-semibold text-arena-accent">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-arena-text-primary hidden md:block max-w-[100px] truncate">
              {user?.displayName || user?.username || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-arena-card border border-arena-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
              <div className="p-2">
                {user?.isAdmin && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-surface rounded-lg transition-colors"
                  >
                    ⚙️ Admin Panel
                  </button>
                )}
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 text-sm text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-surface rounded-lg transition-colors"
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 text-sm text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-surface rounded-lg transition-colors"
                >
                  🔔 Notifications
                </button>
              </div>
              <div className="border-t border-arena-border p-2">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 text-sm text-arena-accent hover:bg-arena-surface rounded-lg transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
