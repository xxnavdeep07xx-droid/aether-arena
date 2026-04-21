'use client';

import { useAppStore, ViewName } from '@/lib/store';
import {
  ArrowLeft, Trophy, Shield, Plus, CheckCircle2, Gamepad2,
  Tv, Link2, Zap, BarChart3, Settings, Mail
} from 'lucide-react';

export function SubViewHeader({ currentView }: { currentView: ViewName }) {
  const { navigate, goBack, previousView } = useAppStore();

  const titles: Record<string, { title: string; back: ViewName; icon: typeof Trophy }> = {
    'tournament-detail': { title: 'Tournament Details', back: 'tournaments', icon: Trophy },
    'admin-dashboard': { title: 'Admin Dashboard', back: 'home', icon: Shield },
    'admin-tournaments': { title: 'Manage Tournaments', back: 'admin-dashboard', icon: Trophy },
    'admin-tournament-create': { title: 'Create Tournament', back: 'admin-tournaments', icon: Plus },
    'admin-registrations': { title: 'Verify Payments', back: 'admin-dashboard', icon: CheckCircle2 },
    'admin-games': { title: 'Manage Games', back: 'admin-dashboard', icon: Gamepad2 },
    'admin-streams': { title: 'Manage Streams', back: 'admin-dashboard', icon: Tv },
    'admin-affiliates': { title: 'Manage Affiliates', back: 'admin-dashboard', icon: Link2 },
    'admin-topup': { title: 'Manage Top Up Packs', back: 'admin-dashboard', icon: Zap },
    'admin-analytics': { title: 'Analytics', back: 'admin-dashboard', icon: BarChart3 },
    'admin-settings': { title: 'Platform Settings', back: 'admin-dashboard', icon: Settings },
    'privacy-policy': { title: 'Privacy Policy', back: 'home', icon: Shield },
    'terms-conditions': { title: 'Terms & Conditions', back: 'home', icon: Shield },
    'refund-policy': { title: 'Refund Policy', back: 'home', icon: Shield },
    'contact': { title: 'Contact Us', back: 'home', icon: Mail },
  };

  const config = titles[currentView] || { title: 'Back', back: 'home' as ViewName, icon: ArrowLeft };
  const Icon = config.icon;

  const handleBack = () => {
    if (previousView) {
      goBack();
    } else {
      navigate(config.back);
    }
  };

  return (
    <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <button onClick={handleBack} className="w-8 h-8 rounded-lg bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-white hover:border-arena-accent/30 transition-all duration-150 flex-shrink-0">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-4 h-4 text-arena-accent flex-shrink-0" />
        <h1 className="text-sm font-semibold truncate">{config.title}</h1>
      </div>
    </div>
  );
}
