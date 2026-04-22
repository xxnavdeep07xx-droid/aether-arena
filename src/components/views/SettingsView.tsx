'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore, useAuthStore } from '@/lib/store';
import {
  Settings, Sun, Moon, Monitor, Globe, Bell, BellOff,
  User, LogOut, Trash2, ShieldCheck, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, Info,
  Pencil, Save, Link2, Mail, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Theme = 'dark' | 'light' | 'system';

// ==================== SETTINGS VIEW ====================

export function SettingsView() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-arena-accent/15 flex items-center justify-center">
          <Settings className="w-5 h-5 text-arena-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-[11px] text-arena-text-muted">Customize your experience</p>
        </div>
      </div>

      <ProfileSettingsSection />
      <ConnectedAccountsSection />
      <AppearanceSection />
      <LanguageSection />
      <NotificationSettingsSection />
      <AccountSection />
    </div>
  );
}

// ==================== PROFILE SETTINGS ====================

function ProfileSettingsSection() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['settings-profile'],
    queryFn: () => fetch('/api/profiles/me').then(r => r.json()),
    enabled: isAuthenticated,
  });

  const currentDisplayName = profile?.displayName || user?.displayName || '';
  const currentBio = profile?.bio || '';

  const startEditing = () => {
    setForm({ displayName: currentDisplayName, bio: currentBio });
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
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  if (!isAuthenticated || !user) return null;

  return (
    <section className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-arena-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Pencil className="w-4 h-4 text-arena-accent" /> Profile Settings
          </h2>
          <p className="text-xs text-arena-text-muted mt-0.5">Update your display name and bio</p>
        </div>
        {!editing && (
          <button onClick={startEditing}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/30 transition-all duration-200">
            Edit
          </button>
        )}
      </div>
      <div className="p-3">
        {!editing ? (
          <div className="px-4 py-3 rounded-xl bg-arena-surface border border-arena-border space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user.username || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{currentDisplayName || user.username}</div>
                <div className="text-xs text-arena-text-muted">@{user.username}</div>
              </div>
            </div>
            {currentBio && (
              <p className="text-xs text-arena-text-secondary px-1">{currentBio}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="text-xs text-arena-text-muted mb-1.5 block font-medium">Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="Your display name"
                maxLength={30}
                className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150"
              />
            </div>
            <div>
              <label className="text-xs text-arena-text-muted mb-1.5 block font-medium">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={200}
                className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150 resize-none"
              />
              <div className="text-[10px] text-arena-text-muted mt-1 text-right">{form.bio.length}/200</div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-arena-accent text-white text-xs font-semibold rounded-xl disabled:opacity-50 hover:bg-arena-accent-light transition-all duration-200">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 border border-arena-border text-xs font-medium rounded-xl text-arena-text-secondary hover:text-white hover:border-white/30 transition-all duration-200">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ==================== CONNECTED ACCOUNTS ====================

function ConnectedAccountsSection() {
  const { user, isAuthenticated } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['settings-connected-profile'],
    queryFn: () => fetch('/api/profiles/me').then(r => r.json()),
    enabled: isAuthenticated,
  });

  const { data: credentials } = useQuery({
    queryKey: ['settings-credentials'],
    queryFn: () => fetch('/api/profiles/me/credentials').then(r => r.json()).catch(() => null),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || !user) return null;

  const discordConnected = !!(profile?.discordId || profile?.discordUsername);
  const email = credentials?.email || null;

  return (
    <section className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-arena-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Link2 className="w-4 h-4 text-arena-accent" /> Connected Accounts
        </h2>
        <p className="text-xs text-arena-text-muted mt-0.5">Manage your linked accounts and credentials</p>
      </div>
      <div className="p-3 space-y-2">
        {/* Discord */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-arena-surface border border-arena-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5865F2]/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium">Discord</div>
              {discordConnected ? (
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected as {profile?.discordUsername || profile?.discordId}
                </div>
              ) : (
                <div className="text-xs text-arena-text-muted">Not connected</div>
              )}
            </div>
          </div>
          {discordConnected ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Connected</span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-arena-surface text-arena-text-muted border border-arena-border">Available</span>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-arena-surface border border-arena-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-arena-accent/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-arena-accent" />
            </div>
            <div>
              <div className="text-sm font-medium">Email</div>
              {email ? (
                <div className="text-xs text-arena-text-secondary truncate max-w-[200px]">{email}</div>
              ) : (
                <div className="text-xs text-arena-text-muted">No email on file</div>
              )}
            </div>
          </div>
          {email ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Verified</span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-arena-surface text-arena-text-muted border border-arena-border">Discord login</span>
          )}
        </div>
      </div>
    </section>
  );
}

// ==================== APPEARANCE / THEME ====================

function AppearanceSection() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('aa-theme') as Theme | null;
    if (saved) setTheme(saved);

    // Listen for OS theme changes when set to "system"
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const current = localStorage.getItem('aa-theme');
      if (current === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    localStorage.setItem('aa-theme', t);

    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
  };

  const themes: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easier on the eyes at night' },
    { value: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright interface' },
    { value: 'system', label: 'System', icon: Monitor, desc: 'Follow your device settings' },
  ];

  return (
    <section className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-arena-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Sun className="w-4 h-4 text-arena-accent" /> Appearance
        </h2>
        <p className="text-xs text-arena-text-muted mt-0.5">Choose your preferred theme</p>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-3 gap-2">
          {themes.map(t => {
            const Icon = t.icon;
            const isActive = theme === t.value;
            return (
              <button key={t.value} onClick={() => applyTheme(t.value)}
                className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'border-arena-accent bg-arena-accent/10'
                    : 'border-arena-border hover:border-arena-accent/40 bg-arena-surface')}>
                <Icon className={cn('w-5 h-5', isActive ? 'text-arena-accent' : 'text-arena-text-secondary')} />
                <span className={cn('text-xs font-semibold', isActive ? 'text-arena-accent' : 'text-arena-text-secondary')}>{t.label}</span>
                <span className="text-[10px] text-arena-text-muted text-center leading-tight">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==================== LANGUAGE ====================

function LanguageSection() {
  const [lang, setLang] = useState('en');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aa-language');
    if (saved) setLang(saved);
  }, []);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', available: true },
    { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳', available: false },
    { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇮🇳', available: false },
    { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳', available: false },
    { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳', available: false },
    { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳', available: false },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  const selectLanguage = (code: string) => {
    const l = languages.find(x => x.code === code);
    if (!l) return;
    if (!l.available) {
      toast.info(`${l.label} support is coming soon!`);
      return;
    }
    setLang(code);
    localStorage.setItem('aa-language', code);
    setExpanded(false);
    toast.success(`Language set to ${l.label}`);
  };

  return (
    <section className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-arena-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Globe className="w-4 h-4 text-arena-accent" /> Language
        </h2>
        <p className="text-xs text-arena-text-muted mt-0.5">Set your preferred language</p>
      </div>
      <div className="p-3">
        {/* Current language */}
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-arena-surface border border-arena-border hover:border-arena-accent/30 transition-all duration-200">
          <div className="flex items-center gap-3">
            <span className="text-lg">{currentLang.flag}</span>
            <div className="text-left">
              <div className="text-sm font-medium">{currentLang.label}</div>
              {!currentLang.available && <div className="text-[10px] text-arena-warning">Coming soon</div>}
            </div>
          </div>
          <ChevronRight className={cn('w-4 h-4 text-arena-text-muted transition-transform duration-200', expanded && 'rotate-90')} />
        </button>

        {/* Language list */}
        {expanded && (
          <div className="mt-2 space-y-1 animate-fade-in">
            {languages.map(l => (
              <button key={l.code} onClick={() => selectLanguage(l.code)}
                className={cn('w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-150',
                  lang === l.code
                    ? 'bg-arena-accent/10 text-arena-accent font-medium'
                    : l.available
                      ? 'text-arena-text-secondary hover:bg-arena-surface hover:text-white'
                      : 'text-arena-text-muted hover:bg-arena-surface cursor-default')}>
                <div className="flex items-center gap-3">
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!l.available && <span className="text-[10px] text-arena-text-muted">Soon</span>}
                  {lang === l.code && <CheckCircle2 className="w-4 h-4 text-arena-accent" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ==================== NOTIFICATION SETTINGS ====================

interface NotificationPrefs {
  pushEnabled: boolean;
  tournamentAlerts: boolean;
  resultUpdates: boolean;
  promoOffers: boolean;
  communityUpdates: boolean;
}

function NotificationSettingsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    pushEnabled: true,
    tournamentAlerts: true,
    resultUpdates: true,
    promoOffers: false,
    communityUpdates: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('aa-notification-prefs');
    if (saved) {
      try { setPrefs(JSON.parse(saved)); } catch { /* use defaults */ }
    }
  }, []);

  const updatePref = (key: keyof NotificationPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem('aa-notification-prefs', JSON.stringify(updated));
    toast.success('Notification preferences updated');
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Your browser does not support push notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updatePref('pushEnabled');
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Push notification permission denied');
    }
  };

  const toggleItems = [
    { key: 'tournamentAlerts' as const, label: 'Tournament Alerts', desc: 'Get notified when tournaments open for registration or are about to start' },
    { key: 'resultUpdates' as const, label: 'Result Updates', desc: 'Receive updates when tournament results are published' },
    { key: 'promoOffers' as const, label: 'Promotions & Offers', desc: 'Special deals on top-ups, gaming gear, and events' },
    { key: 'communityUpdates' as const, label: 'Community Updates', desc: 'News, announcements, and platform updates' },
  ];

  return (
    <section className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-arena-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-arena-accent" /> Notifications
        </h2>
        <p className="text-xs text-arena-text-muted mt-0.5">Control how you receive notifications</p>
      </div>
      <div className="p-3 space-y-1">
        {/* Push notifications master toggle */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-arena-surface border border-arena-border">
          <div className="flex items-center gap-3">
            {prefs.pushEnabled ? <Bell className="w-4 h-4 text-arena-accent" /> : <BellOff className="w-4 h-4 text-arena-text-muted" />}
            <div>
              <div className="text-sm font-medium">Push Notifications</div>
              <div className="text-[10px] text-arena-text-muted">Browser push alerts</div>
            </div>
          </div>
          <button
            onClick={prefs.pushEnabled ? () => updatePref('pushEnabled') : requestPushPermission}
            className={cn('relative w-11 h-6 rounded-full transition-colors duration-200',
              prefs.pushEnabled ? 'bg-arena-accent' : 'bg-arena-border')}>
            <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
              prefs.pushEnabled ? 'translate-x-[22px]' : 'translate-x-0.5')} />
          </button>
        </div>

        {/* Individual notification toggles */}
        {toggleItems.map(item => (
          <div key={item.key} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-arena-surface/50 transition-colors duration-150">
            <div className="flex-1 mr-3">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-[10px] text-arena-text-muted leading-relaxed">{item.desc}</div>
            </div>
            <button onClick={() => updatePref(item.key)}
              className={cn('relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                prefs[item.key] ? 'bg-arena-accent' : 'bg-arena-border')}>
              <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                prefs[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5')} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ==================== ACCOUNT MANAGEMENT ====================

function AccountSection() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { navigate } = useAppStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); // 0: not started, 1: type username, 2: final confirm
  const [typedUsername, setTypedUsername] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isAuthenticated || !user) return null;

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* continue */ }
    logout();
    navigate('landing');
    toast.success('Logged out successfully');
  };

  const startDeleteFlow = () => {
    setDeleteStep(1);
    setTypedUsername('');
    setShowDeleteConfirm(true);
  };

  const cancelDeleteFlow = () => {
    setDeleteStep(0);
    setTypedUsername('');
    setShowDeleteConfirm(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteStep === 1 && typedUsername === user.username) {
      setDeleteStep(2);
      return;
    }
    if (deleteStep === 2) {
      setDeleting(true);
      try {
        const res = await fetch('/api/profiles/me/delete', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || 'Account scheduled for deletion. You have 30 days to recover.');
          logout();
          navigate('landing');
        } else {
          toast.error(data.error || 'Failed to delete account');
          cancelDeleteFlow();
        }
      } catch {
        toast.error('Something went wrong. Please try again.');
        cancelDeleteFlow();
      }
      setDeleting(false);
    }
  };

  const canProceed = deleteStep === 1 ? typedUsername === user.username : deleteStep === 2;

  return (
    <section className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-arena-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-arena-accent" /> Account
        </h2>
        <p className="text-xs text-arena-text-muted mt-0.5">Manage your account settings</p>
      </div>
      <div className="p-3 space-y-2">
        {/* Account info */}
        <div className="px-4 py-3 rounded-xl bg-arena-surface border border-arena-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0">
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user.username || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user.displayName || user.username}</div>
              <div className="text-xs text-arena-text-muted">@{user.username}</div>
            </div>
            {user.isAdmin && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-arena-accent/15 text-arena-accent flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Logout button */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arena-text-secondary hover:bg-arena-surface hover:text-white transition-all duration-200">
          <LogOut className="w-4 h-4" /> Log Out
        </button>

        {/* Delete account button */}
        {!showDeleteConfirm ? (
          <button onClick={startDeleteFlow}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arena-accent/70 hover:bg-arena-accent/10 hover:text-arena-accent transition-all duration-200">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        ) : (
          <div className="bg-arena-accent/5 border border-arena-accent/20 rounded-xl p-4 animate-fade-in space-y-3">
            {deleteStep === 1 && (
              <>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-arena-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-arena-accent">Delete your account?</div>
                    <div className="text-xs text-arena-text-secondary mt-1 leading-relaxed">
                      This is a serious action. Your account will be scheduled for deletion with a 30-day recovery period.
                      After 30 days, all your data will be permanently removed.
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-arena-text-muted mb-1.5 block">
                    Type <span className="font-mono font-bold text-white">&quot;{user.username}&quot;</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={typedUsername}
                    onChange={e => setTypedUsername(e.target.value)}
                    placeholder={user.username}
                    className="w-full bg-arena-dark border border-arena-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={cancelDeleteFlow}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-arena-border text-arena-text-secondary hover:text-white hover:border-white/30 transition-all duration-200">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={handleDeleteAccount} disabled={!canProceed || deleting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-arena-accent text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-arena-accent-light transition-all duration-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> {deleting ? 'Deleting...' : 'Continue'}
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-arena-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-arena-warning">Final Confirmation</div>
                    <div className="text-xs text-arena-text-secondary mt-1 leading-relaxed">
                      <strong>30-day recovery window:</strong> If you change your mind, simply log back in within 30 days
                      and your account will be fully restored. After 30 days, your profile, tournament history,
                      leaderboard data, and all associated information will be permanently deleted from our servers.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-arena-surface rounded-lg border border-arena-border">
                  <Trash2 className="w-4 h-4 text-arena-accent flex-shrink-0" />
                  <div className="text-xs text-arena-text-muted">
                    This action affects <span className="text-white font-medium">{user.username}</span> and cannot be undone after 30 days.
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={cancelDeleteFlow}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-arena-border text-arena-text-secondary hover:text-white hover:border-white/30 transition-all duration-200">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={handleDeleteAccount} disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500 transition-all duration-200">
                    <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Please wait...' : 'Yes, Delete My Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
