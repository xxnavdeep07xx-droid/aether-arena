'use client';

import { useQuery } from '@tanstack/react-query';
import { Tv, CircleDot, Calendar, Eye } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import { StreamsSkeleton } from './Skeletons';

export function StreamsView() {
  const { data: streams, isLoading } = useQuery({
    queryKey: ['all-streams'],
    queryFn: () => fetch('/api/streams').then(r => r.json()).then(d => d.streams || d || []),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Tv className="w-6 h-6 text-arena-accent" /> Live Streams
      </h1>
      {isLoading ? (
        <StreamsSkeleton />
      ) : streams && streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streams.map((s: any) => (
            <div key={s.id} onClick={() => s.streamUrl && window.open(s.streamUrl, '_blank')} className="bg-arena-card border border-arena-border rounded-xl p-5 hover:border-arena-accent/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', s.status === 'live' ? 'bg-arena-accent text-white flex items-center gap-1' : 'bg-arena-info/20 text-arena-info')}>
                  {s.status === 'live' && <CircleDot className="w-3 h-3 animate-pulse" />}
                  {s.status.toUpperCase()}
                </span>
                <span className="text-xs text-arena-text-muted capitalize bg-arena-surface px-2 py-0.5 rounded-full">{s.platform}</span>
              </div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-arena-text-secondary mb-3 line-clamp-2">{s.description}</p>
              <div className="flex items-center justify-between text-xs text-arena-text-muted">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(s.scheduledStart)}</span>
                {s.peakViewers > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {s.peakViewers} viewers</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
            <Tv className="w-10 h-10 text-arena-accent/40" />
          </div>
          <p className="text-base font-semibold text-arena-text-secondary mb-2">No streams scheduled</p>
          <p className="text-xs text-arena-text-muted max-w-sm mx-auto">
            Stay tuned! We will announce upcoming streams and live tournament broadcasts here. Follow us to get notified.
          </p>
        </div>
      )}
    </div>
  );
}
