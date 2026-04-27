'use client';

import { useAppStore, useAuthStore, ViewName } from '@/lib/store';
import { useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users, Trophy, Clock, DollarSign, CheckCircle2, XCircle, Plus,
  Eye, Trash2, Gamepad2, Pencil, X, Tv, ExternalLink, Link2,
  ShoppingBag, Zap, Settings, BarChart3, User, TrendingUp,
  ChevronRight, AlertTriangle, Wallet,
  Share2, Calendar, Globe, Gift, Bell
} from 'lucide-react';
import { ArenaModal } from '@/components/ui/ArenaModal';
import { AetherIcon } from '@/components/ui/aether-icon';
import { cn, paiseToRupee, getStatusBg, getFormatLabel, formatDateTime, timeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Area, AreaChart
} from 'recharts';
import { ThemedSkeleton } from './Skeletons';
import Image from 'next/image';

// ==================== REUSABLE CONFIRM DIALOG ====================

interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

function ConfirmDialog({ state, onClose }: { state: ConfirmDialogState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-sm animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-center mb-1">{state.title}</h3>
        <p className="text-sm text-arena-text-secondary text-center mb-6">{state.description}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 h-10 border border-arena-border rounded-xl text-sm font-medium hover:border-arena-text-primary transition-colors duration-150">Cancel</button>
          <button onClick={() => { state.onConfirm(); onClose(); }} className="flex-1 py-2.5 h-10 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 text-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

function useConfirmDialog() {
  const [dialog, setDialog] = useState<ConfirmDialogState>({ open: false, title: '', description: '', onConfirm: () => {} });
  const confirm = useCallback((title: string, description: string, onConfirm: () => void) => {
    setDialog({ open: true, title, description, onConfirm });
  }, []);
  const close = useCallback(() => setDialog(d => ({ ...d, open: false })), []);
  return { dialog, confirm, close };
}

// ==================== ADMIN DASHBOARD ====================

export function AdminDashboardView() {
  const { user } = useAuthStore();
  const { navigate } = useAppStore();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
  });

  if (!user?.isAdmin) return <div className="text-center py-20 text-arena-text-muted">Access Denied</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-arena-info' },
    { label: 'Active Tournaments', value: stats?.activeTournaments || 0, icon: Trophy, color: 'text-arena-success' },
    { label: 'Pending Verifications', value: stats?.pendingVerifications || 0, icon: Clock, color: 'text-arena-warning' },
    { label: 'Total Revenue', value: paiseToRupee(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-arena-accent' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-arena-card border border-arena-border rounded-xl p-5">
            <card.icon className={cn('w-6 h-6 mb-3', card.color)} />
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs text-arena-text-muted">{card.label}</div>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Manage Tournaments', icon: Trophy, view: 'admin-tournaments' as ViewName },
          { label: 'Verify Payments', icon: CheckCircle2, view: 'admin-registrations' as ViewName },
          { label: 'Manage Games', icon: Gamepad2, view: 'admin-games' as ViewName },
          { label: 'Manage Streams', icon: Tv, view: 'admin-streams' as ViewName },
          { label: 'Manage Affiliates', icon: Link2, view: 'admin-affiliates' as ViewName },
          { label: 'Top Up Packs', icon: Zap, view: 'admin-topup' as ViewName },
          { label: 'Analytics', icon: BarChart3, view: 'admin-analytics' as ViewName },
          { label: 'Manage Redemptions', icon: Wallet, view: 'admin-redemptions' as ViewName },
          { label: 'Aether Manage', icon: Zap, view: 'admin-aether-manage' as ViewName },
          { label: 'Platform Settings', icon: Settings, view: 'admin-settings' as ViewName },
        ].map(action => (
          <button key={action.label} onClick={() => navigate(action.view)}
            className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center gap-3 hover:border-arena-accent/30 transition-all duration-200 hover:-translate-y-0.5 text-left">
            <action.icon className="w-5 h-5 text-arena-accent" />
            <span className="text-sm font-medium">{action.label}</span>
            <ChevronRight className="w-4 h-4 text-arena-text-muted ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN TOURNAMENTS ====================

export function AdminTournamentsView() {
  const { navigate } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('');
  const { dialog, confirm, close } = useConfirmDialog();

  const { data: tournaments, refetch } = useQuery({
    queryKey: ['admin-tournaments', statusFilter],
    queryFn: () => fetch(`/api/admin/tournaments${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()).then(d => Array.isArray(d.tournaments) ? d.tournaments : Array.isArray(d) ? d : []),
  });

  const deleteTournament = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, { method: 'DELETE' });
      if (!res.ok) { const data = await res.json().catch(() => ({})); toast.error(data.error || 'Failed to delete tournament'); return; }
      refetch();
      toast.success('Tournament deleted');
    } catch { toast.error('Failed to delete tournament'); }
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button onClick={() => navigate('admin-tournament-create')} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['', 'registration_open', 'in_progress', 'upcoming', 'completed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200',
              statusFilter === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary')}>
            {s === '' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {tournaments?.map((t: any) => (
          <div key={t.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between hover:border-arena-accent/30 transition-all duration-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{t.title}</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', getStatusBg(t?.status))}>{t?.status ? t.status.replace(/_/g, ' ') : ''}</span>
              </div>
              <div className="text-xs text-arena-text-muted">{t.game?.name} • {paiseToRupee(t.entryFee)} • {t.registeredPlayers}/{t.maxPlayers} players</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button onClick={() => navigate('admin-tournament-create', { id: t.id })} aria-label="Edit tournament" className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150"><Pencil className="w-4 h-4 text-arena-text-muted" /></button>
              <button onClick={() => navigate('tournament-detail', { id: t.id })} aria-label="View tournament" className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150"><Eye className="w-4 h-4 text-arena-text-muted" /></button>
              <button onClick={() => confirm('Delete Tournament', 'Are you sure you want to delete this tournament? This action cannot be undone.', () => deleteTournament(t.id))} aria-label="Delete tournament" className="p-1.5 rounded-lg hover:bg-arena-accent/10 transition-colors duration-150"><Trash2 className="w-4 h-4 text-arena-text-muted hover:text-arena-accent" /></button>
            </div>
          </div>
        ))}
      </div>
      {dialog.open && <ConfirmDialog state={dialog} onClose={close} />}
    </div>
  );
}

// ==================== ADMIN TOURNAMENT CREATE ====================

export function AdminTournamentCreateView() {
  const { navigate, viewParams } = useAppStore();
  const editId = viewParams?.id;
  const { data: games } = useQuery({ queryKey: ['admin-games'], queryFn: () => fetch('/api/games').then(r => r.json()).then(d => Array.isArray(d.games) ? d.games : Array.isArray(d) ? d : []) });

  const [form, setForm] = useState({ title: '', description: '', gameId: '', format: 'solo', entryFee: '0', prizePool: '0', maxPlayers: '100', startTime: '', customRules: '', isFeatured: false, roomId: '', roomPassword: '', map: '', matchMode: '', bannerImageUrl: '', status: 'upcoming' });
  const [saving, setSaving] = useState(false);

  // Fetch existing tournament data for editing
  const { data: existingTournament, isLoading: loadingExisting } = useQuery({
    queryKey: ['admin-tournament-edit', editId],
    queryFn: () => fetch(`/api/admin/tournaments/${editId}`).then(r => r.json()).then(d => d.tournament || d),
    enabled: !!editId,
  });

  // Populate form when editing data loads
  const hasPopulated = useRef(false);
  if (editId && existingTournament && !hasPopulated.current && !loadingExisting) {
    const t = existingTournament;
    setForm({
      title: t.title || '',
      description: t.description || '',
      gameId: t.gameId || '',
      format: t.format || 'solo',
      entryFee: String((t.entryFee || 0) / 100),
      prizePool: String((t.prizePool || 0) / 100),
      maxPlayers: String(t.maxPlayers || 100),
      startTime: t.startTime ? new Date(t.startTime).toISOString().slice(0, 16) : '',
      customRules: t.customRules || '',
      isFeatured: t.isFeatured || false,
      roomId: t.roomId || '',
      roomPassword: t.roomPassword || '',
      map: t.map || '',
      matchMode: t.matchMode || '',
      bannerImageUrl: t.bannerImageUrl || '',
      status: t.status || 'upcoming',
    });
    hasPopulated.current = true;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        entryFee: Math.round(Number(form.entryFee) * 100),
        prizePool: Math.round(Number(form.prizePool) * 100),
        maxPlayers: Number(form.maxPlayers),
        startTime: form.startTime || null,
      };
      const url = editId ? `/api/admin/tournaments/${editId}` : '/api/admin/tournaments';
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editId ? 'Tournament updated!' : 'Tournament created!');
        navigate('admin-tournaments');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save tournament');
      }
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150";
  const labelClass = "text-xs text-arena-text-secondary mb-1 block";

  return (
    <div>
      <form onSubmit={handleCreate} className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4 max-w-2xl">
        <div><label className={labelClass}>Title *</label><input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Game *</label><select required value={form.gameId} onChange={e => setForm({ ...form, gameId: e.target.value })} className={inputClass}><option value="">Select Game</option>{games?.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div><label className={labelClass}>Format</label><select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })} className={inputClass}>{['solo','duo','squad','custom'].map(f => <option key={f} value={f}>{getFormatLabel(f)}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className={labelClass}>Entry Fee (₹)</label><input type="number" min="0" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Prize Pool (₹)</label><input type="number" min="0" value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Max Players *</label><input type="number" required min="2" value={form.maxPlayers} onChange={e => setForm({ ...form, maxPlayers: e.target.value })} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}>
              <option value="upcoming">Upcoming</option>
              <option value="registration_open">Open for Registration (Now)</option>
              <option value="in_progress">In Progress (Live)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Start Time</label><input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Map</label><input type="text" value={form.map} onChange={e => setForm({ ...form, map: e.target.value })} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} /></div>
        <div><label className={labelClass}>Custom Rules</label><textarea rows={3} value={form.customRules} onChange={e => setForm({ ...form, customRules: e.target.value })} className={cn(inputClass, 'resize-none')} /></div>
        <div><label className={labelClass}>Banner Image URL</label><input type="url" value={form.bannerImageUrl} onChange={e => setForm({ ...form, bannerImageUrl: e.target.value })} className={inputClass} placeholder="https://example.com/banner.jpg" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Room ID</label><input type="text" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Room Password</label><input type="text" value={form.roomPassword} onChange={e => setForm({ ...form, roomPassword: e.target.value })} className={inputClass} /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-arena-accent" />
          <span className="text-sm">Mark as Featured</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? (editId ? 'Updating...' : 'Creating...') : editId ? 'Update Tournament' : 'Create Tournament'}</button>
          <button type="button" onClick={() => navigate('admin-tournaments')} className="px-6 py-2.5 h-11 border border-arena-border rounded-xl text-sm font-medium hover:border-arena-text-primary transition-colors duration-150">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ==================== ADMIN REGISTRATIONS ====================

export function AdminRegistrationsView() {
  const [filter, setFilter] = useState('pending');

  const { data: registrations, refetch } = useQuery({
    queryKey: ['admin-registrations', filter],
    queryFn: () => fetch(`/api/admin/registrations?status=${filter}`).then(r => r.json()).then(d => Array.isArray(d.registrations) ? d.registrations : Array.isArray(d) ? d : []),
  });

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}/verify`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to verify payment');
        return;
      }
      refetch();
      toast.success('Payment verified!');
    } catch {
      toast.error('Failed to verify payment');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}/reject`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to reject payment');
        return;
      }
      refetch();
      toast.success('Payment rejected');
    } catch {
      toast.error('Failed to reject payment');
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['pending', 'verified', 'failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
              filter === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary')}>
            {s.replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>
      {registrations && registrations.length > 0 ? (
        <div className="space-y-2">
          {registrations.map((r: any) => (
            <div key={r.id} className="bg-arena-card border border-arena-border rounded-xl p-4 hover:border-arena-accent/20 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0">
                    {r.player?.avatarUrl ? <Image src={r.player.avatarUrl} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized loading="lazy" /> : (r.player?.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{r.player?.displayName || r.player?.username || 'Unknown'}</div>
                    <div className="text-xs text-arena-text-muted">@{r.player?.username}</div>
                  </div>
                </div>
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full',
                  r.paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' :
                  r.paymentStatus === 'pending' ? 'bg-arena-warning/20 text-arena-warning' : 'bg-arena-accent/20 text-arena-accent'
                )}>{r.paymentStatus === 'verified' ? 'Verified' : r.paymentStatus === 'pending' ? 'Pending' : 'Rejected'}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                <div className="bg-arena-surface rounded-lg p-2">
                  <div className="text-arena-text-muted">Tournament</div>
                  <div className="font-medium truncate">{r.tournament?.title}</div>
                </div>
                <div className="bg-arena-surface rounded-lg p-2">
                  <div className="text-arena-text-muted">Game</div>
                  <div className="font-medium">{r.tournament?.game?.name || 'N/A'}</div>
                </div>
                <div className="bg-arena-surface rounded-lg p-2">
                  <div className="text-arena-text-muted">Amount</div>
                  <div className="font-bold text-arena-accent">{paiseToRupee(r.paidAmount)}</div>
                </div>
                <div className="bg-arena-surface rounded-lg p-2">
                  <div className="text-arena-text-muted">Registered</div>
                  <div className="font-medium">{timeAgo(r.createdAt)}</div>
                </div>
              </div>
              {r.paymentReference && (
                <div className="text-[10px] text-arena-text-muted mb-2">Payment Ref: <span className="font-mono">{r.paymentReference}</span></div>
              )}
              {r.paymentStatus === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(r.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-arena-success/20 text-arena-success text-xs font-medium rounded-lg hover:bg-arena-success/30 transition-colors duration-150"><CheckCircle2 className="w-3 h-3" /> Verify</button>
                  <button onClick={() => handleReject(r.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-arena-accent/20 text-arena-accent text-xs font-medium rounded-lg hover:bg-arena-accent/30 transition-colors duration-150"><XCircle className="w-3 h-3" /> Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-arena-text-muted">No registrations found</div>
      )}
    </div>
  );
}

// ==================== ADMIN GAMES ====================

export function AdminGamesView() {
  const { data: games, refetch } = useQuery({
    queryKey: ['admin-games-list'],
    queryFn: () => fetch('/api/admin/games').then(r => r.json()).then(d => Array.isArray(d.games) ? d.games : Array.isArray(d) ? d : []),
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { dialog, confirm, close } = useConfirmDialog();

  const emptyForm = { name: '', slug: '', iconUrl: '', bannerUrl: '', maxTeamSize: 1, description: '', isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (game: any) => { setForm({ name: game.name, slug: game.slug, iconUrl: game.iconUrl || '', bannerUrl: game.bannerUrl || '', maxTeamSize: game.maxTeamSize, description: game.description || '', isActive: game.isActive, sortOrder: game.sortOrder }); setEditing(game); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/games/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to update game'); setSaving(false); return; }
        toast.success('Game updated!');
      } else {
        const res = await fetch('/api/admin/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to create game'); setSaving(false); return; }
        toast.success('Game created!');
      }
      setShowModal(false);
      refetch();
    } catch { toast.error('Failed to save game'); }
    setSaving(false);
  };

  const deleteGame = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to delete game'); return; }
      toast.success('Game deleted'); refetch();
    } catch { toast.error('Failed to delete game'); }
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors duration-150";

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" /> Add Game
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {games?.map((g: any) => (
          <div key={g.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center gap-4 hover:border-arena-accent/30 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0">
              {g.iconUrl ? <Image src={g.iconUrl} alt={g.name} width={32} height={32} className="w-8 h-8 object-contain rounded-lg" unoptimized /> : <Gamepad2 className="w-6 h-6 text-arena-accent" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{g.name}</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', g.isActive ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-text-muted/20 text-arena-text-muted')}>{g.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-xs text-arena-text-muted">{g.slug} • Max Team: {g.maxTeamSize} • Sort: {g.sortOrder}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Edit game"><Pencil className="w-3.5 h-3.5 text-arena-text-muted" /></button>
              <button onClick={() => confirm('Delete Game', 'Are you sure? This may affect associated tournaments.', () => deleteGame(g.id))} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors duration-150" aria-label="Delete game"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      <ArenaModal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Game' : 'New Game'} icon={<Gamepad2 className="w-5 h-5" />} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="BGMI" /></div>
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Slug *</label><input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/\s/g, '').toLowerCase() })} className={inputClass} placeholder="bgmi" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Icon URL</label><input type="url" value={form.iconUrl} onChange={e => setForm({ ...form, iconUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Banner URL</label><input type="url" value={form.bannerUrl} onChange={e => setForm({ ...form, bannerUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
          </div>
          <div><label className="text-xs text-arena-text-secondary mb-1 block">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} placeholder="Game description" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Max Team Size</label><input type="number" min={1} value={form.maxTeamSize} onChange={e => setForm({ ...form, maxTeamSize: parseInt(e.target.value) || 1 })} className={inputClass} /></div>
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-arena-accent" />
            <span className="text-sm text-arena-text-secondary">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 h-10 border border-arena-border hover:border-arena-accent/50 text-arena-text-primary font-medium rounded-xl transition-all duration-200 text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </ArenaModal>
      {dialog.open && <ConfirmDialog state={dialog} onClose={close} />}
    </div>
  );
}

// ==================== ADMIN STREAMS ====================

export function AdminStreamsView() {
  const { data: streams, refetch } = useQuery({
    queryKey: ['admin-streams-list'],
    queryFn: () => fetch('/api/admin/streams').then(r => r.json()).then(d => Array.isArray(d.streams) ? d.streams : Array.isArray(d) ? d : []),
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { dialog, confirm, close } = useConfirmDialog();

  const emptyForm = { title: '', description: '', platform: '', streamUrl: '', thumbnailUrl: '', scheduledStart: '', scheduledEnd: '', isFeatured: false, status: 'scheduled' };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (s: any) => { setForm({ title: s.title, description: s.description || '', platform: s.platform || '', streamUrl: s.streamUrl || '', thumbnailUrl: s.thumbnailUrl || '', scheduledStart: s.scheduledStart ? new Date(s.scheduledStart).toISOString().slice(0, 16) : '', scheduledEnd: s.scheduledEnd ? new Date(s.scheduledEnd).toISOString().slice(0, 16) : '', isFeatured: s.isFeatured || false, status: s.status || 'scheduled' }); setEditing(s); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title || !form.scheduledStart) { toast.error('Title and scheduled start are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/streams/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to update stream'); setSaving(false); return; }
        toast.success('Stream updated!');
      } else {
        const res = await fetch('/api/admin/streams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to create stream'); setSaving(false); return; }
        toast.success('Stream created!');
      }
      setShowModal(false);
      refetch();
    } catch { toast.error('Failed to save stream'); }
    setSaving(false);
  };

  const deleteStream = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/streams/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to delete stream'); return; }
      toast.success('Stream deleted'); refetch();
    } catch { toast.error('Failed to delete stream'); }
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors duration-150";

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" /> Add Stream
        </button>
      </div>
      <div className="space-y-3">
        {streams?.map((s: any) => (
          <div key={s.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between hover:border-arena-accent/30 transition-all duration-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{s.title}</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', s.status === 'live' ? 'bg-arena-accent text-white' : 'bg-arena-info/20 text-arena-info')}>{s?.status ? s.status.toUpperCase() : 'UNKNOWN'}</span>
                {s.isFeatured && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-arena-warning/20 text-arena-warning flex-shrink-0">Featured</span>}
              </div>
              <p className="text-xs text-arena-text-muted">{s.platform} • {formatDateTime(s.scheduledStart)} • {s.peakViewers} peak viewers</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              {s.streamUrl && <a href={s.streamUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Open stream"><ExternalLink className="w-3.5 h-3.5 text-arena-text-muted" /></a>}
              <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Edit stream"><Pencil className="w-3.5 h-3.5 text-arena-text-muted" /></button>
              <button onClick={() => confirm('Delete Stream', 'Are you sure you want to delete this stream?', () => deleteStream(s.id))} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors duration-150" aria-label="Delete stream"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      <ArenaModal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Stream' : 'New Stream'} icon={<Tv className="w-5 h-5" />} size="lg">
        <div className="space-y-3">
          <div><label className="text-xs text-arena-text-secondary mb-1 block">Title *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Stream title" /></div>
          <div><label className="text-xs text-arena-text-secondary mb-1 block">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} placeholder="Stream description" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Platform</label><select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={inputClass}><option value="">Select</option><option value="youtube">YouTube</option><option value="twitch">Twitch</option><option value="facebook">Facebook</option><option value="other">Other</option></select></div>
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="ended">Ended</option><option value="cancelled">Cancelled</option></select></div>
          </div>
          <div><label className="text-xs text-arena-text-secondary mb-1 block">Stream URL</label><input type="url" value={form.streamUrl} onChange={e => setForm({ ...form, streamUrl: e.target.value })} className={inputClass} placeholder="https://youtube.com/watch?v=..." /></div>
          <div><label className="text-xs text-arena-text-secondary mb-1 block">Thumbnail URL</label><input type="url" value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Scheduled Start *</label><input type="datetime-local" value={form.scheduledStart} onChange={e => setForm({ ...form, scheduledStart: e.target.value })} className={inputClass} /></div>
            <div><label className="text-xs text-arena-text-secondary mb-1 block">Scheduled End</label><input type="datetime-local" value={form.scheduledEnd} onChange={e => setForm({ ...form, scheduledEnd: e.target.value })} className={inputClass} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-arena-accent" />
            <span className="text-sm text-arena-text-secondary">Featured</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 h-10 border border-arena-border hover:border-arena-accent/50 text-arena-text-primary font-medium rounded-xl transition-all duration-200 text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </ArenaModal>
      {dialog.open && <ConfirmDialog state={dialog} onClose={close} />}
    </div>
  );
}

// ==================== ADMIN AFFILIATES ====================

export function AdminAffiliatesView() {
  const { data: affiliates, refetch } = useQuery({
    queryKey: ['admin-affiliates-list'],
    queryFn: () => fetch('/api/admin/affiliates').then(r => r.json()).then(d => Array.isArray(d.affiliates) ? d.affiliates : Array.isArray(d) ? d : []),
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { dialog, confirm, close } = useConfirmDialog();

  const emptyForm = { name: '', platform: '', url: '', slug: '', description: '', category: '', imageUrl: '', price: 0, originalPrice: 0, isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (a: any) => { setForm({ name: a.name, platform: a.platform || '', url: a.url, slug: a.slug, description: a.description || '', category: a.category || '', imageUrl: a.imageUrl || '', price: a.price || 0, originalPrice: a.originalPrice || 0, isActive: a.isActive, sortOrder: a.sortOrder || 0 }); setEditing(a); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.url || !form.slug) { toast.error('Name, URL, and slug are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/affiliates/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to update affiliate'); setSaving(false); return; }
        toast.success('Affiliate updated!');
      } else {
        const res = await fetch('/api/admin/affiliates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to create affiliate'); setSaving(false); return; }
        toast.success('Affiliate created!');
      }
      setShowModal(false);
      refetch();
    } catch { toast.error('Failed to save affiliate'); }
    setSaving(false);
  };

  const deleteAffiliate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to delete affiliate'); return; }
      toast.success('Affiliate deleted'); refetch();
    } catch { toast.error('Failed to delete affiliate'); }
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors duration-150";

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" /> Add Affiliate
        </button>
      </div>
      <div className="space-y-2">
        {affiliates?.map((a: any) => (
          <div key={a.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between hover:border-arena-accent/30 transition-all duration-200">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {a.imageUrl ? <Image src={a.imageUrl} alt={a.name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" unoptimized loading="lazy" /> : <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0"><ShoppingBag className="w-5 h-5 text-arena-accent" /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{a.name}</h3>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', a.isActive ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-text-muted/20 text-arena-text-muted')}>{a.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-xs text-arena-text-muted">{a.platform} • {paiseToRupee(a.price)}{a.originalPrice > a.price ? ` (was ${paiseToRupee(a.originalPrice)})` : ''} • {a.clicks} clicks</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Open affiliate link"><ExternalLink className="w-3.5 h-3.5 text-arena-text-muted" /></a>
              <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Edit affiliate"><Pencil className="w-3.5 h-3.5 text-arena-text-muted" /></button>
              <button onClick={() => confirm('Delete Affiliate', 'Are you sure you want to delete this affiliate?', () => deleteAffiliate(a.id))} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors duration-150" aria-label="Delete affiliate"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editing ? 'Edit Affiliate' : 'New Affiliate'}</h2>
              <button onClick={() => setShowModal(false)} className="text-arena-text-muted hover:text-arena-text-primary" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Product name" /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Slug *</label><input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/\s/g, '-').toLowerCase() })} className={inputClass} placeholder="product-slug" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Platform</label><input type="text" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={inputClass} placeholder="Amazon" /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Category</label><input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="Gaming" /></div>
              </div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">URL *</label><input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className={inputClass} placeholder="https://amazon.in/..." /></div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Image URL</label><input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} placeholder="Product description" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Price (₹ paise)</label><input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className={inputClass} placeholder="49900 = ₹499" /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Original Price (₹ paise)</label><input type="number" min={0} value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: parseInt(e.target.value) || 0 })} className={inputClass} placeholder="99900 = ₹999" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-arena-accent" />
                  <span className="text-sm text-arena-text-secondary">Active</span>
                </label>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 h-10 border border-arena-border hover:border-arena-accent/50 text-arena-text-primary font-medium rounded-xl transition-all duration-200 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {dialog.open && <ConfirmDialog state={dialog} onClose={close} />}
    </div>
  );
}

// ==================== ADMIN SETTINGS ====================

export function AdminSettingsView() {
  const [saving, setSaving] = useState(false);

  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => fetch('/api/admin/settings').then(r => r.json()).then(d => d && typeof d === 'object' && !Array.isArray(d) && !d.error ? (d.settings || d) : {}),
  });

  const [localSettings, setLocalSettings] = useState<Record<string, string> | null>(null);
  const settings = localSettings !== null ? localSettings : ((fetchedSettings || {}) as Record<string, string>);

  // Razorpay specific state
  const [rzpKeyId, setRzpKeyId] = useState('');
  const [rzpKeySecret, setRzpKeySecret] = useState('');
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [rzpConfirmStep, setRzpConfirmStep] = useState(0); // 0=none, 1=first confirm, 2=ready to save
  const [rzpSaving, setRzpSaving] = useState(false);

  // Sync razorpay fields from settings
  useState(() => {
    if (fetchedSettings && !localSettings) {
      setRzpKeyId(fetchedSettings.razorpay_key_id || '');
      setRzpKeySecret(fetchedSettings.razorpay_key_secret || '');
      setRzpWebhookSecret(fetchedSettings.razorpay_webhook_secret || '');
    }
  });

  const handleRzpSave = async () => {
    if (rzpConfirmStep === 0) {
      setRzpConfirmStep(1);
      return;
    }
    if (rzpConfirmStep === 1) {
      setRzpConfirmStep(2);
      return;
    }
    // Step 2: actually save
    setRzpSaving(true);
    try {
      const newSettings: Record<string, string> = { ...settings };
      newSettings.razorpay_key_id = rzpKeyId.trim();
      newSettings.razorpay_key_secret = rzpKeySecret.trim();
      newSettings.razorpay_webhook_secret = rzpWebhookSecret.trim();
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      setLocalSettings(newSettings);
      toast.success('Razorpay credentials saved!');
      setRzpConfirmStep(0);
    } catch { toast.error('Failed to save Razorpay settings'); }
    setRzpSaving(false);
  };

  const handleGenericSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    setSaving(false);
  };

  const rzpConfigured = !!(settings.razorpay_key_id && settings.razorpay_key_secret);
  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150";

  return (
    <div>
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-arena-card border border-arena-border rounded-xl h-12" />)}
        </div>
      ) : (
        <div className="space-y-6 max-w-xl">
          {/* Razorpay Payment Gateway Section */}
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', rzpConfigured ? 'bg-arena-success/10' : 'bg-arena-warning/10')}>
                <span className={cn('text-lg', rzpConfigured ? 'text-arena-success' : 'text-arena-warning')}>{rzpConfigured ? '✓' : '!'}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Razorpay Payment Gateway
                  {rzpConfigured && <span className="text-[10px] bg-arena-success/20 text-arena-success font-medium px-2 py-0.5 rounded-full">Connected</span>}
                </h2>
                <p className="text-xs text-arena-text-muted">Configure Razorpay to accept online payments for tournaments</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Razorpay Key ID</label>
                <input type="text" value={rzpKeyId} onChange={e => { setRzpKeyId(e.target.value); setRzpConfirmStep(0); }}
                  placeholder="rzp_live_xxxxxxxxxxxxxxx" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Razorpay Key Secret</label>
                <div className="relative">
                  <input type={showSecret ? 'text' : 'password'} value={rzpKeySecret} onChange={e => { setRzpKeySecret(e.target.value); setRzpConfirmStep(0); }}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={inputClass} />
                  <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-arena-text-muted hover:text-arena-text-primary">
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Webhook Secret (Optional)</label>
                <input type="text" value={rzpWebhookSecret} onChange={e => { setRzpWebhookSecret(e.target.value); setRzpConfirmStep(0); }}
                  placeholder="whsec_xxxxxxxxxxxxxxxx" className={inputClass} />
              </div>

              {/* Double Confirmation UI */}
              {rzpConfirmStep > 0 && (
                <div className={cn('rounded-xl p-3 text-sm', rzpConfirmStep === 1 ? 'bg-arena-warning/10 border border-arena-warning/30' : 'bg-arena-success/10 border border-arena-success/30')}>
                  {rzpConfirmStep === 1 ? (
                    <>
                      <p className="font-medium text-arena-warning mb-1">Step 1: Confirm Changes</p>
                      <p className="text-xs text-arena-text-secondary">You are about to update Razorpay credentials. This affects all payment processing. Click save again to confirm.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-arena-success mb-1">Step 2: Final Confirmation</p>
                      <p className="text-xs text-arena-text-secondary">Last chance! Click save one more time to apply changes permanently.</p>
                    </>
                  )}
                </div>
              )}

              <button onClick={handleRzpSave} disabled={rzpSaving || (!rzpKeyId.trim() && !rzpKeySecret.trim())}
                className={cn('w-full py-2.5 h-11 font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50 flex items-center justify-center gap-2',
                  rzpConfirmStep === 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  rzpConfirmStep === 1 ? 'bg-arena-warning hover:bg-arena-warning/80 text-white' :
                  'bg-arena-success hover:bg-arena-success/80 text-white')}>
                {rzpSaving ? 'Saving...' : rzpConfirmStep === 0 ? 'Save Razorpay Credentials' : rzpConfirmStep === 1 ? 'Click Again to Confirm' : 'Final Click to Apply'}
              </button>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', settings.maintenance_mode === 'true' ? 'bg-arena-warning/10' : 'bg-arena-surface')}>
                  <AlertTriangle className={cn('w-5 h-5', settings.maintenance_mode === 'true' ? 'text-arena-warning' : 'text-arena-text-muted')} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Maintenance Mode</h2>
                  <p className="text-xs text-arena-text-muted">Temporarily disable the platform for all users</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const newVal = settings.maintenance_mode === 'true' ? 'false' : 'true';
                  setLocalSettings({ ...settings, maintenance_mode: newVal });
                  fetch('/api/admin/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...settings, maintenance_mode: newVal }),
                  }).then(() => toast.success(newVal === 'true' ? 'Maintenance mode enabled' : 'Maintenance mode disabled')).catch(() => toast.error('Failed'));
                }}
                className={cn('relative w-14 h-7 rounded-full transition-colors duration-200 flex-shrink-0',
                  settings.maintenance_mode === 'true' ? 'bg-arena-warning' : 'bg-arena-border')}>
                <div className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200',
                  settings.maintenance_mode === 'true' ? 'translate-x-[30px]' : 'translate-x-0.5')} />
              </button>
            </div>
            {settings.maintenance_message && settings.maintenance_mode === 'true' && (
              <div className="mt-3 p-3 bg-arena-warning/5 border border-arena-warning/20 rounded-lg">
                <p className="text-xs text-arena-warning font-medium">Message: {settings.maintenance_message}</p>
              </div>
            )}
          </div>

          {/* Platform General Settings */}
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold">Platform Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Platform Name</label>
                <input type="text" value={settings.platform_name || ''} onChange={e => setLocalSettings({ ...settings, platform_name: e.target.value })}
                  placeholder="Aether Arena" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Support Email</label>
                <input type="email" value={settings.support_email || ''} onChange={e => setLocalSettings({ ...settings, support_email: e.target.value })}
                  placeholder="support@aetherarena.com" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Discord Invite Link</label>
                <input type="url" value={settings.discord_invite || ''} onChange={e => setLocalSettings({ ...settings, discord_invite: e.target.value })}
                  placeholder="https://discord.gg/aetherarena" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Default Max Players</label>
                <input type="number" min="2" value={settings.default_max_players || '100'} onChange={e => setLocalSettings({ ...settings, default_max_players: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Registration Fee (%)</label>
                <input type="number" min="0" max="100" step="0.1" value={settings.platform_fee_percent || '0'} onChange={e => setLocalSettings({ ...settings, platform_fee_percent: e.target.value })}
                  placeholder="Platform fee percentage" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Min Withdrawal (₹)</label>
                <input type="number" min="0" value={settings.min_withdrawal || '100'} onChange={e => setLocalSettings({ ...settings, min_withdrawal: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-arena-text-secondary mb-1 block">Maintenance Message (leave empty to disable)</label>
              <input type="text" value={settings.maintenance_message || ''} onChange={e => setLocalSettings({ ...settings, maintenance_message: e.target.value })}
                placeholder="Site is under maintenance..." className={inputClass} />
            </div>
            <button onClick={handleGenericSave} disabled={saving} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Platform Settings'}
            </button>
          </div>

          {/* Social Links Section */}
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-arena-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Social Links</h2>
                <p className="text-xs text-arena-text-muted">Connect your social media profiles</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Instagram URL</label>
                <input type="url" value={settings.social_instagram || ''} onChange={e => setLocalSettings({ ...settings, social_instagram: e.target.value })}
                  placeholder="https://instagram.com/aetherarena" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Twitter / X URL</label>
                <input type="url" value={settings.social_twitter || ''} onChange={e => setLocalSettings({ ...settings, social_twitter: e.target.value })}
                  placeholder="https://x.com/aetherarena" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">YouTube URL</label>
                <input type="url" value={settings.social_youtube || ''} onChange={e => setLocalSettings({ ...settings, social_youtube: e.target.value })}
                  placeholder="https://youtube.com/@aetherarena" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Telegram URL</label>
                <input type="url" value={settings.social_telegram || ''} onChange={e => setLocalSettings({ ...settings, social_telegram: e.target.value })}
                  placeholder="https://t.me/aetherarena" className={inputClass} />
              </div>
            </div>
            <button onClick={handleGenericSave} disabled={saving} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Social Links'}
            </button>
          </div>

          {/* Tournament Defaults Section */}
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-arena-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Tournament Defaults</h2>
                <p className="text-xs text-arena-text-muted">Configure default tournament creation settings</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Default Registration Period (hours)</label>
                <input type="number" min="1" max="720" value={settings.tournament_default_reg_hours || '24'} onChange={e => setLocalSettings({ ...settings, tournament_default_reg_hours: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Max Concurrent Tournaments per User</label>
                <input type="number" min="1" max="100" value={settings.tournament_max_per_user || '5'} onChange={e => setLocalSettings({ ...settings, tournament_max_per_user: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-arena-surface border border-arena-border">
              <div>
                <div className="text-sm font-medium">Auto-start Tournaments</div>
                <div className="text-[10px] text-arena-text-muted">Automatically start tournaments when start time is reached</div>
              </div>
              <button
                onClick={() => {
                  const newVal = settings.tournament_auto_start === 'true' ? 'false' : 'true';
                  setLocalSettings({ ...settings, tournament_auto_start: newVal });
                  fetch('/api/admin/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...settings, tournament_auto_start: newVal }),
                  }).then(() => toast.success(newVal === 'true' ? 'Auto-start enabled' : 'Auto-start disabled')).catch(() => toast.error('Failed'));
                }}
                className={cn('relative w-14 h-7 rounded-full transition-colors duration-200 flex-shrink-0',
                  settings.tournament_auto_start === 'true' ? 'bg-arena-accent' : 'bg-arena-border')}>
                <div className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200',
                  settings.tournament_auto_start === 'true' ? 'translate-x-[30px]' : 'translate-x-0.5')} />
              </button>
            </div>
            <button onClick={handleGenericSave} disabled={saving} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Tournament Defaults'}
            </button>
          </div>

          {/* SEO & Branding Section */}
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-arena-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">SEO & Branding</h2>
                <p className="text-xs text-arena-text-muted">Configure meta tags and brand assets</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-arena-text-secondary mb-1 block">Site Description</label>
              <textarea rows={3} value={settings.seo_description || ''} onChange={e => setLocalSettings({ ...settings, seo_description: e.target.value })}
                placeholder="India's fastest-growing mobile esports tournament platform..." className={cn(inputClass, 'resize-none')} maxLength={300} />
              <div className="text-[10px] text-arena-text-muted mt-1 text-right">{(settings.seo_description || '').length}/300</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">OG Image URL</label>
                <input type="url" value={settings.seo_og_image || ''} onChange={e => setLocalSettings({ ...settings, seo_og_image: e.target.value })}
                  placeholder="https://example.com/og-image.png" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Custom Favicon URL</label>
                <input type="url" value={settings.branding_favicon || ''} onChange={e => setLocalSettings({ ...settings, branding_favicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico" className={inputClass} />
              </div>
            </div>
            <button onClick={handleGenericSave} disabled={saving} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save SEO & Branding'}
            </button>
          </div>

          {/* Referral System Section */}
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-arena-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Referral System</h2>
                <p className="text-xs text-arena-text-muted">Configure the referral reward program</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-arena-surface border border-arena-border">
              <div>
                <div className="text-sm font-medium">Referral Program Enabled</div>
                <div className="text-[10px] text-arena-text-muted">Allow users to earn rewards by referring friends</div>
              </div>
              <button
                onClick={() => {
                  const newVal = settings.referral_enabled === 'true' ? 'false' : 'true';
                  setLocalSettings({ ...settings, referral_enabled: newVal });
                  fetch('/api/admin/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...settings, referral_enabled: newVal }),
                  }).then(() => toast.success(newVal === 'true' ? 'Referral program enabled' : 'Referral program disabled')).catch(() => toast.error('Failed'));
                }}
                className={cn('relative w-14 h-7 rounded-full transition-colors duration-200 flex-shrink-0',
                  settings.referral_enabled === 'true' ? 'bg-arena-accent' : 'bg-arena-border')}>
                <div className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200',
                  settings.referral_enabled === 'true' ? 'translate-x-[30px]' : 'translate-x-0.5')} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Referral Bonus (Aether Coins)</label>
                <input type="number" min="0" value={settings.referral_bonus || '50'} onChange={e => setLocalSettings({ ...settings, referral_bonus: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Max Referrals per User</label>
                <input type="number" min="0" value={settings.referral_max_per_user || '0'} onChange={e => setLocalSettings({ ...settings, referral_max_per_user: e.target.value })}
                  placeholder="0 = unlimited" className={inputClass} />
              </div>
            </div>
            <button onClick={handleGenericSave} disabled={saving} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Referral Settings'}
            </button>
          </div>

          {/* Notification Settings Section */}
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-arena-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Notification Settings</h2>
                <p className="text-xs text-arena-text-muted">Configure platform-wide notification preferences</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { key: 'notify_email_enabled', label: 'Email Notifications', desc: 'Send email notifications to users' },
                { key: 'notify_registration', label: 'Registration Alerts', desc: 'Notify users about tournament registration events' },
                { key: 'notify_results', label: 'Result Announcements', desc: 'Send results when tournaments conclude' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between px-4 py-3 rounded-xl bg-arena-surface border border-arena-border">
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-[10px] text-arena-text-muted">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => {
                      const newVal = settings[item.key] === 'true' ? 'false' : 'true';
                      setLocalSettings({ ...settings, [item.key]: newVal });
                      fetch('/api/admin/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...settings, [item.key]: newVal }),
                      }).then(() => toast.success(`${item.label} ${newVal === 'true' ? 'enabled' : 'disabled'}`)).catch(() => toast.error('Failed'));
                    }}
                    className={cn('relative w-14 h-7 rounded-full transition-colors duration-200 flex-shrink-0',
                      settings[item.key] === 'true' ? 'bg-arena-accent' : 'bg-arena-border')}>
                    <div className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200',
                      settings[item.key] === 'true' ? 'translate-x-[30px]' : 'translate-x-0.5')} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN TOP UP PACKS ====================

export function AdminTopupView() {
  const { data: packs, refetch } = useQuery({
    queryKey: ['admin-topup-packs'],
    queryFn: () => fetch('/api/admin/topup-packs').then(r => r.json()).then(d => Array.isArray(d.packs) ? d.packs : []),
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editingPack, setEditingPack] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { dialog, confirm, close } = useConfirmDialog();

  const emptyForm = { gameName: '', gameSlug: '', packName: '', description: '', price: 0, originalPrice: 0, imageUrl: '', affiliateUrl: '', isPopular: false, isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditingPack(null); setShowCreate(true); };
  const openEdit = (pack: any) => { setForm(pack); setEditingPack(pack); setShowCreate(true); };

  const handleSave = async () => {
    if (!form.gameName || !form.gameSlug || !form.packName) { toast.error('Game name, slug, and pack name are required'); return; }
    setSaving(true);
    try {
      if (editingPack) {
        await fetch(`/api/admin/topup-packs/${editingPack.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Pack updated!');
      } else {
        await fetch('/api/admin/topup-packs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Pack created!');
      }
      setShowCreate(false);
      refetch();
    } catch { toast.error('Failed to save pack'); }
    setSaving(false);
  };

  const deletePack = async (id: string) => {
    try {
      await fetch(`/api/admin/topup-packs/${id}`, { method: 'DELETE' });
      toast.success('Pack deleted'); refetch();
    } catch { toast.error('Failed to delete pack'); }
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-medium rounded-xl transition-all duration-200 text-sm">
          <Plus className="w-4 h-4" /> Add Pack
        </button>
      </div>

      <div className="space-y-2">
        {packs?.map((pack: any) => (
          <div key={pack.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-arena-warning/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-arena-warning" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-medium text-sm">{pack.gameName} — {pack.packName}</h3>
                  {pack.isPopular && <span className="text-[10px] bg-arena-warning/20 text-arena-warning px-1.5 py-0.5 rounded-full">🔥 Popular</span>}
                </div>
                <p className="text-xs text-arena-text-muted">₹{(pack.price / 100).toLocaleString('en-IN')}{pack.originalPrice > pack.price ? ` (was ₹${(pack.originalPrice / 100).toLocaleString('en-IN')})` : ''} • Sort: {pack.sortOrder}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', pack.isActive ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-text-muted/20 text-arena-text-muted')}>{pack.isActive ? 'Active' : 'Inactive'}</span>
              <button onClick={() => openEdit(pack)} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors"><Pencil className="w-3.5 h-3.5 text-arena-text-muted" /></button>
              <button onClick={() => confirm('Delete Pack', 'Are you sure you want to delete this top-up pack?', () => deletePack(pack.id))} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editingPack ? 'Edit Pack' : 'New Pack'}</h2>
              <button onClick={() => setShowCreate(false)} className="text-arena-text-muted hover:text-arena-text-primary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Game Name *</label>
                  <input type="text" value={form.gameName} onChange={e => setForm({ ...form, gameName: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="BGMI" />
                </div>
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Game Slug *</label>
                  <input type="text" value={form.gameSlug} onChange={e => setForm({ ...form, gameSlug: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="bgmi" />
                </div>
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Pack Name *</label>
                <input type="text" value={form.packName} onChange={e => setForm({ ...form, packName: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="60 UC" />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="Basic currency pack" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Price (₹ paise) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Original Price (₹ paise)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: parseInt(e.target.value) || 0 })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Affiliate URL (Codashop)</label>
                <input type="url" value={form.affiliateUrl} onChange={e => setForm({ ...form, affiliateUrl: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="https://www.codashop.com/in/bgmi" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPopular" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} className="accent-arena-accent" />
                  <label htmlFor="isPopular" className="text-xs text-arena-text-secondary">Popular</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-arena-accent" />
                  <label htmlFor="isActive" className="text-xs text-arena-text-secondary">Active</label>
                </div>
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Sort</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-arena-accent transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 h-10 border border-arena-border hover:border-arena-accent/50 text-arena-text-primary font-medium rounded-xl transition-all duration-200 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Saving...' : editingPack ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {dialog.open && <ConfirmDialog state={dialog} onClose={close} />}
    </div>
  );
}

// ==================== ADMIN ANALYTICS ====================

export function AdminAnalyticsView() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(r => r.json()),
    refetchInterval: 120000,
  });

  const d = data?.overview;
  const STATUS_COLORS: Record<string, string> = {
    upcoming: '#00aaff',
    registration_open: '#00ff88',
    ongoing: '#ffaa00',
    live: '#ff4444',
    completed: '#22c55e',
    cancelled: '#666666',
  };
  const LEAGUE_COLORS: Record<string, string> = {
    bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700',
    platinum: '#00bcd4', diamond: '#b9f2ff', master: '#aa44ff',
    grandmaster: '#ff44ff', legend: '#ff6600',
  };

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="bg-arena-card border border-arena-border rounded-xl p-4"><ThemedSkeleton className="h-4 w-16 mb-2" /><ThemedSkeleton className="h-6 w-24" /></div>)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl font-bold">📊 Analytics Dashboard</h1>
        <span className="text-[10px] bg-arena-accent/20 text-arena-accent font-medium px-2 py-0.5 rounded-full">Live</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Players', value: d?.totalPlayers?.toLocaleString(), icon: Users, color: 'text-arena-accent', bg: 'bg-arena-accent/10' },
          { label: 'Total Revenue', value: `₹${((d?.totalRevenue || 0) / 100).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-arena-success', bg: 'bg-arena-success/10' },
          { label: 'Active Tours', value: String(d?.activeTournaments || 0), icon: Trophy, color: 'text-arena-warning', bg: 'bg-arena-warning/10' },
          { label: 'Registrations', value: `${d?.todayRegistrations || 0} today`, sub: `${d?.weekRegistrations || 0}/wk ${d?.monthRegistrations || 0}/mo`, icon: User, color: 'text-arena-info', bg: 'bg-arena-info/10' },
          { label: 'Avg. Value', value: paiseToRupee(d?.avgRegistrationValue || 0), icon: TrendingUp, color: 'text-arena-purple', bg: 'bg-arena-purple/10' },
          { label: 'Live Streams', value: String(d?.liveStreams || 0), icon: Tv, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-arena-card border border-arena-border rounded-xl p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', kpi.bg)}>
              <kpi.icon className={cn('w-4 h-4', kpi.color)} />
            </div>
            <p className="text-lg font-bold">{kpi.value}</p>
            <p className="text-[10px] text-arena-text-muted">{kpi.label}</p>
            {kpi.sub && <p className="text-[9px] text-arena-text-muted mt-0.5">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-arena-card border border-arena-border rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4">Revenue &amp; Registrations (12 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenueByMonth || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v: number) => `₹${(v / 100).toLocaleString('en-IN')}`} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: number) => [`₹${(value / 100).toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#00ff88" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two columns: Games + Status */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Registrations by Game */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Registrations by Game</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.registrationsByGame || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis dataKey="game" type="category" tick={{ fill: '#999', fontSize: 11 }} width={80} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="registrations" fill="#00ff88" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tournaments by Status */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Tournaments by Status</h3>
          <div className="h-52 flex items-center justify-center">
            {(data?.tournamentsByStatus || []).length === 0 ? (
              <p className="text-sm text-arena-text-muted">No tournament data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={(data?.tournamentsByStatus || []).map((s: any) => ({ ...s, name: s.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" paddingAngle={2}>
                    {(data?.tournamentsByStatus || []).map((s: any, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[s.status] || '#666'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {(data?.tournamentsByStatus || []).map((s: any) => (
              <span key={s.status} className="flex items-center gap-1.5 text-[10px] text-arena-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] || '#666' }} />
                {s.status.replace(/_/g, ' ')} ({s.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Three columns: Top Players + League + Activity */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Top Players */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">🏆 Top Players</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(data?.topPlayers || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-arena-surface/50 transition-colors duration-200">
                <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-amber-700/20 text-amber-500' : 'bg-arena-surface text-arena-text-muted'
                )}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.player?.displayName || p.player?.username}</p>
                  <p className="text-[10px] text-arena-text-muted">{p.totalWins}W / {p.totalMatches}M • KD: {p.kdRatio}</p>
                </div>
                <span className="text-xs font-semibold text-arena-accent">{p.totalPoints.toLocaleString()}</span>
              </div>
            ))}
            {(!data?.topPlayers || data.topPlayers.length === 0) && <p className="text-xs text-arena-text-muted text-center py-4">No data yet</p>}
          </div>
        </div>

        {/* League Distribution */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">League Distribution</h3>
          <div className="h-48 flex items-center justify-center">
            {(data?.leagueDistribution || []).length === 0 ? (
              <p className="text-sm text-arena-text-muted">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.leagueDistribution || []} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="count" paddingAngle={2}>
                    {(data?.leagueDistribution || []).map((l: any, i: number) => (
                      <Cell key={i} fill={LEAGUE_COLORS[l.league] || '#666'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {(data?.leagueDistribution || []).slice(0, 6).map((l: any) => (
              <span key={l.league} className="flex items-center gap-1.5 text-[10px] text-arena-text-secondary">
                <span className="w-2 h-2 rounded-full" style={{ background: LEAGUE_COLORS[l.league] || '#666' }} />
                {l.league} ({l.count})
              </span>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">📋 Recent Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(data?.recentActivity || []).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-arena-surface/30">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  a.paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' : a.paymentStatus === 'pending' ? 'bg-arena-warning/20 text-arena-warning' : 'bg-red-400/20 text-red-400'
                )}>
                  {a.paymentStatus === 'verified' ? '✓' : a.paymentStatus === 'pending' ? '⏳' : '✗'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{a.player?.displayName || a.player?.username}</p>
                  <p className="text-[10px] text-arena-text-muted truncate">{a.tournament?.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold">{paiseToRupee(a.paidAmount)}</p>
                  <p className="text-[10px] text-arena-text-muted">{timeAgo(a.createdAt)}</p>
                </div>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && <p className="text-xs text-arena-text-muted text-center py-4">No activity yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN REDEMPTIONS ====================

export function AdminRedemptionsView() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; redemptionId: string; action: string }>({ open: false, redemptionId: '', action: '' });
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['admin-redemptions', statusFilter],
    queryFn: () => fetch(`/api/admin/redemptions${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()),
    enabled: user?.isAdmin,
  });

  const redemptions = data?.redemptions || [];

  const handleAction = async (redemptionId: string, action: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/redemptions/${redemptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNote: note || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Failed to update redemption');
        setProcessing(false);
        return;
      }
      toast.success(`Redemption ${action}d successfully`);
      setNoteDialog({ open: false, redemptionId: '', action: '' });
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['admin-redemptions'] });
      refetch();
    } catch {
      toast.error('Failed to update redemption');
    }
    setProcessing(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    paid: 'bg-blue-500/20 text-blue-400',
  };

  if (!user?.isAdmin) return <div className="text-center py-20 text-arena-text-muted">Access Denied</div>;

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['', 'pending', 'approved', 'rejected', 'paid'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200',
              statusFilter === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary')}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {redemptions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena-border text-xs text-arena-text-muted">
                <th className="text-left py-2 px-3 font-medium">User</th>
                <th className="text-left py-2 px-3 font-medium">Amount</th>
                <th className="text-left py-2 px-3 font-medium">UPI ID</th>
                <th className="text-left py-2 px-3 font-medium">Status</th>
                <th className="text-left py-2 px-3 font-medium">Date</th>
                <th className="text-right py-2 px-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r: any) => (
                <tr key={r.id} className="border-b border-arena-border/50 hover:bg-arena-card/50">
                  <td className="py-3 px-3">
                    <div className="font-medium">{r.user?.displayName || r.user?.username || 'Unknown'}</div>
                    <div className="text-xs text-arena-text-muted">@{r.user?.username}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold">{r.amountAether} ◆</div>
                    <div className="text-xs text-arena-text-muted">₹{r.amountInr}</div>
                  </td>
                  <td className="py-3 px-3 text-xs text-arena-text-secondary">{r.upiId || '—'}</td>
                  <td className="py-3 px-3">
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', statusColors[r.status] || '')}>{r.status}</span>
                  </td>
                  <td className="py-3 px-3 text-xs text-arena-text-muted">{timeAgo(r.createdAt)}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => { setNoteDialog({ open: true, redemptionId: r.id, action: 'approve' }); setNote(''); }}
                            className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-medium rounded-lg hover:bg-green-500/30">Approve</button>
                          <button onClick={() => { setNoteDialog({ open: true, redemptionId: r.id, action: 'reject' }); setNote(''); }}
                            className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-medium rounded-lg hover:bg-red-500/30">Reject</button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button onClick={() => { setNoteDialog({ open: true, redemptionId: r.id, action: 'mark_paid' }); setNote(''); }}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-medium rounded-lg hover:bg-blue-500/30">Mark Paid</button>
                      )}
                      {r.adminNote && <span className="text-[10px] text-arena-text-muted ml-1" title={r.adminNote}>📋</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-arena-text-muted">No redemption requests found</div>
      )}

      {/* Note dialog */}
      {noteDialog.open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setNoteDialog({ open: false, redemptionId: '', action: '' })}>
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-sm animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1 capitalize">{noteDialog.action === 'mark_paid' ? 'Mark as Paid' : `${noteDialog.action} Redemption`}</h3>
            <p className="text-xs text-arena-text-muted mb-4">Add an optional admin note</p>
            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note..."
              className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setNoteDialog({ open: false, redemptionId: '', action: '' })} className="flex-1 py-2.5 h-10 border border-arena-border rounded-xl text-sm font-medium hover:border-arena-text-primary transition-colors">Cancel</button>
              <button onClick={() => handleAction(noteDialog.redemptionId, noteDialog.action)} disabled={processing}
                className={cn('flex-1 py-2.5 h-10 text-white font-semibold rounded-xl text-sm disabled:opacity-50',
                  noteDialog.action === 'reject' ? 'bg-red-500 hover:bg-red-600' : noteDialog.action === 'mark_paid' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600')}>
                {processing ? <span className="animate-pulse">Processing...</span> : noteDialog.action === 'mark_paid' ? 'Mark Paid' : noteDialog.action === 'reject' ? 'Reject' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN AETHER MANAGE ====================

export function AdminAetherManageView() {
  const { user } = useAuthStore();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['admin-aether-stats'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
    enabled: user?.isAdmin,
  });

  const handleAdjust = async () => {
    if (!userId || !amount) { toast.error('User ID and amount are required'); return; }
    setAdjusting(true);
    try {
      const res = await fetch('/api/admin/aether/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: Number(amount), reason: reason || 'Admin adjustment' }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Failed to adjust balance');
        setAdjusting(false);
        return;
      }
      const data = await res.json();
      setNewBalance(data.newBalance);
      toast.success(`Balance adjusted! New balance: ${data.newBalance} ◆`);
      setAmount('');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-aether-stats'] });
    } catch {
      toast.error('Failed to adjust balance');
    }
    setAdjusting(false);
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150";
  const labelClass = "text-xs text-arena-text-secondary mb-1 block";

  if (!user?.isAdmin) return <div className="text-center py-20 text-arena-text-muted">Access Denied</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Adjust User Balance */}
      <div className="bg-arena-card border border-arena-border rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AetherIcon size="md" /> Adjust User Balance
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>User ID or Username *</label>
            <input type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="Enter user ID or username" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Amount (positive to add, negative to deduct) *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 100 or -50" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Reason</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for adjustment" className={inputClass} />
          </div>
          {newBalance !== null && (
            <div className="bg-arena-dark rounded-lg px-4 py-2 text-sm">
              <span className="text-arena-text-muted">New Balance: </span>
              <span className="font-bold text-arena-accent">{newBalance} ◆</span>
            </div>
          )}
          <button onClick={handleAdjust} disabled={adjusting || !userId || !amount}
            className="px-6 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50">
            {adjusting ? <span className="animate-pulse">Adjusting...</span> : 'Adjust Balance'}
          </button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-arena-card border border-arena-border rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-arena-accent" /> Platform Stats
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-arena-info' },
            { label: 'Total Revenue', value: paiseToRupee(stats?.totalRevenue || 0), color: 'text-arena-accent' },
          ].map(s => (
            <div key={s.label} className="bg-arena-dark rounded-xl p-4">
              <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
              <div className="text-xs text-arena-text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
