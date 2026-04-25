'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Bell } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { NotificationsSkeleton } from './Skeletons';

export function NotificationsView() {
  const { navigate } = useAppStore();
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()).then(d => Array.isArray(d.notifications) ? d.notifications : Array.isArray(d) ? d : []),
  });

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (!res.ok) {
        toast.error('Failed to mark notifications as read');
        return;
      }
      refetch();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleClick = async (n: any) => {
    // Mark as read
    if (!n.isRead) {
      try {
        await fetch(`/api/notifications/${n.id}/read`, { method: 'POST' });
        refetch();
      } catch { /* ignore */ }
    }

    // Navigate based on link
    if (n.link) {
      const link = n.link;
      if (link.startsWith('/tournaments/')) {
        const tournamentId = link.replace('/tournaments/', '');
        navigate('tournament-detail', { id: tournamentId });
      }
    }
  };

  if (isLoading) return <NotificationsSkeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="w-6 h-6 text-arena-accent" /> Notifications</h1>
        {notifications && notifications.some((n: any) => !n.isRead) && (
          <button onClick={markAllRead} className="text-xs text-arena-accent hover:underline">Mark all as read</button>
        )}
      </div>
      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id} onClick={() => handleClick(n)}
              className={cn('bg-arena-card border rounded-xl p-4 transition-all duration-200 cursor-pointer',
                !n.isRead ? 'border-arena-accent/30 bg-arena-accent/5 hover:bg-arena-accent/10' : 'border-arena-border hover:border-arena-accent/20')}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  <p className="text-xs text-arena-text-secondary mt-1">{n.message}</p>
                </div>
                <span className="text-[10px] text-arena-text-muted whitespace-nowrap ml-4">{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
            <Bell className="w-10 h-10 text-arena-accent/40" />
          </div>
          <p className="text-base font-semibold text-arena-text-secondary mb-2">All caught up!</p>
          <p className="text-xs text-arena-text-muted max-w-sm mx-auto">
            You have no notifications right now. We will notify you about tournament updates, results, and platform news here.
          </p>
        </div>
      )}
    </div>
  );
}
