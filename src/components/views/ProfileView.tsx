'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Trophy, Crown, Target, Coins, LogOut, Wallet, ChevronRight } from 'lucide-react';
import { cn, paiseToRupee, formatDate, LEAGUE_CONFIG } from '@/lib/utils';
import { toast } from 'sonner';
import { ProfileSkeleton } from './Skeletons';

export function ProfileView() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const { navigate, viewParams } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const viewingOtherUser = !!viewParams.username && viewParams.username !== user?.username;

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: viewingOtherUser ? ['other-profile', viewParams.username] : ['my-profile'],
    queryFn: () => fetch(viewingOtherUser ? `/api/profiles/${viewParams.username}` : '/api/profiles/me').then(r => r.json()),
    enabled: isAuthenticated || viewingOtherUser,
  });

  const { data: registrations } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => fetch('/api/registrations').then(r => r.json()).then(d => d.registrations || d || []),
    enabled: isAuthenticated && !viewingOtherUser,
  });

  const startEditing = () => {
    if (profile) setForm({ displayName: profile.displayName || '', bio: profile.bio || '' });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile || data);
        setEditing(false);
        toast.success('Profile updated!');
        refetch();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* continue logout regardless */ }
    logout();
    navigate('landing');
  };

  if (viewingOtherUser && isLoading) return <ProfileSkeleton />;
  if (viewingOtherUser && !profile) return <div className="text-center py-20 text-arena-text-muted">Profile not found</div>;
  if (!viewingOtherUser && !isAuthenticated) return null;
  if (!viewingOtherUser && isLoading) return <ProfileSkeleton />;

  const p = profile || user;
  const league = LEAGUE_CONFIG[p?.league || 'bronze'] || LEAGUE_CONFIG.bronze;

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-br from-arena-accent/20 via-arena-purple/15 to-arena-surface" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 border-4 border-arena-card flex items-center justify-center text-2xl font-bold overflow-hidden">
              {p?.avatarUrl ? <img src={p.avatarUrl} alt={`${p.username}'s avatar`} className="w-full h-full object-cover" /> : (p?.username || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{p?.displayName || p?.username}</h1>
                <span className="text-sm font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: league.color + '20', color: league.color }}>
                  {league.icon} {league.label}
                </span>
              </div>
              <p className="text-sm text-arena-text-muted">@{p?.username}</p>
            </div>
            {!viewingOtherUser && (
              <button onClick={() => editing ? setEditing(false) : startEditing()} className="p-2 rounded-xl border border-arena-border hover:border-arena-accent/50 transition-colors duration-150">
                <Pencil className="w-4 h-4 text-arena-text-secondary" />
              </button>
            )}
          </div>

          {/* Edit Form (only for own profile) */}
          {!viewingOtherUser && editing && (
            <div className="bg-arena-surface rounded-xl p-4 mb-4 space-y-3 animate-fade-in">
              <div>
                <label className="text-xs text-arena-text-muted mb-1 block">Display Name</label>
                <input type="text" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  className="w-full bg-arena-dark border border-arena-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arena-accent" />
              </div>
              <div>
                <label className="text-xs text-arena-text-muted mb-1 block">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                  className="w-full bg-arena-dark border border-arena-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arena-accent resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-arena-accent text-white text-xs font-semibold rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 border border-arena-border text-xs font-medium rounded-lg hover:border-white transition-colors duration-150">Cancel</button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Tournaments', value: p?.totalTournamentsPlayed || 0, icon: Trophy },
              { label: 'Wins', value: p?.totalWins || 0, icon: Crown },
              { label: 'Kills', value: p?.totalKills || 0, icon: Target },
              { label: 'Prize Won', value: paiseToRupee(p?.totalPrizeWon || 0), icon: Coins },
            ].map(stat => (
              <div key={stat.label} className="bg-arena-surface rounded-xl p-3 text-center">
                <stat.icon className="w-4 h-4 text-arena-accent mx-auto mb-1" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-[10px] text-arena-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          {p?.bio && <p className="text-sm text-arena-text-secondary">{p.bio}</p>}
        </div>
      </div>

      {/* My Tournaments (only for own profile) */}
      {!viewingOtherUser && (
        <div className="bg-arena-card border border-arena-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4">My Tournaments</h2>
          {registrations && registrations.length > 0 ? (
            <div className="space-y-2">
              {registrations.map((r: any) => (
                <div key={r.id} onClick={() => navigate('tournament-detail', { id: r.tournamentId })}
                  className="flex items-center justify-between bg-arena-surface rounded-xl p-3 cursor-pointer hover:bg-arena-card-hover transition-colors duration-150">
                  <div>
                    <div className="font-medium text-sm">{r.tournament?.title || 'Unknown Tournament'}</div>
                    <div className="text-xs text-arena-text-muted">{r.tournament?.game?.name} • {formatDate(r.createdAt)}</div>
                  </div>
                  <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full',
                    r.paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' :
                    r.paymentStatus === 'pending' ? 'bg-arena-warning/20 text-arena-warning' :
                    r.paymentStatus === 'failed' ? 'bg-arena-accent/20 text-arena-accent' : 'bg-arena-surface text-arena-text-muted'
                  )}>
                    {r.paymentStatus.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-arena-accent/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-arena-accent/40" />
              </div>
              <p className="text-sm text-arena-text-secondary mb-1">No tournaments yet</p>
              <p className="text-xs text-arena-text-muted mb-3">Join a tournament and show your skills!</p>
              <button onClick={() => navigate('tournaments')} className="text-xs font-medium px-4 py-2 rounded-lg bg-arena-accent text-white hover:bg-arena-accent-light transition-all duration-200">
                Browse Tournaments
              </button>
            </div>
          )}
        </div>
      )}

      {/* Redemptions Admin Card (only for admin, own profile) */}
      {!viewingOtherUser && user?.isAdmin && (
        <button
          onClick={() => navigate('admin-redemptions')}
          className="w-full bg-arena-card border border-arena-border rounded-2xl p-5 mb-6 flex items-center gap-4 hover:border-arena-accent/30 transition-all duration-200 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-sm">Redemptions</div>
            <div className="text-xs text-arena-text-muted">Manage and process Aether redemption requests</div>
          </div>
          <ChevronRight className="w-5 h-5 text-arena-text-muted flex-shrink-0" />
        </button>
      )}

      {/* Logout (only for own profile) */}
      {!viewingOtherUser && (
        <button onClick={handleLogout} className="flex items-center gap-2 text-arena-text-muted hover:text-arena-accent text-sm transition-colors duration-150">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      )}
    </div>
  );
}
