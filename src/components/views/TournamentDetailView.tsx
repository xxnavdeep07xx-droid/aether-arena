'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star, CircleDot, Calendar, MonitorPlay, Gamepad2,
  Shield, Copy, X, Loader2
} from 'lucide-react';
import { cn, paiseToRupee, getStatusBg, getFormatLabel, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from './Skeletons';

export function TournamentDetailView() {
  const { viewParams, navigate } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', viewParams.id],
    queryFn: () => fetch(`/api/tournaments/${viewParams.id}`).then(r => r.json()),
    enabled: !!viewParams.id,
  });

  useEffect(() => {
    if (!tournament || !isAuthenticated) return;
    const checkRegistration = async () => {
      try {
        const res = await fetch('/api/registrations');
        const data = await res.json();
        const regs = data.registrations || data || [];
        const existing = regs.find((r: any) => r.tournamentId === viewParams.id);
        if (existing) { setRegistered(true); setPaymentStatus(existing.paymentStatus); }
      } catch {}
    };
    checkRegistration();
  }, [tournament, isAuthenticated, viewParams.id]);

  const handleRegister = async (data: { paymentMethod?: string; paymentReference?: string }) => {
    try {
      const res = await fetch(`/api/tournaments/${viewParams.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setRegistered(true);
        setPaymentStatus(result.registration?.paymentStatus || 'pending');
        setShowRegister(false);
        toast.success(tournament.entryFee === 0 ? 'Registered successfully!' : 'Payment submitted! Waiting for verification.');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed');
    }
  };

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
  if (!tournament) return <div className="text-center py-20 text-arena-text-muted">Tournament not found</div>;

  const t = tournament;
  const canRegister = isAuthenticated && t.status === 'registration_open' && (t.registeredPlayers || 0) < t.maxPlayers && !registered;

  return (
    <div>
      {/* Header */}
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-arena-accent/20 via-arena-purple/15 to-arena-surface flex items-center justify-center relative">
          <Gamepad2 className="w-16 h-16 text-arena-text-muted/30" />
          <div className="absolute top-4 left-4 flex gap-2">
            {t.isFeatured && <span className="bg-arena-gold/20 text-arena-gold text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
            <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', getStatusBg(t.status))}>
              {t.status === 'in_progress' ? <span className="flex items-center gap-1"><CircleDot className="w-3 h-3 animate-pulse" /> LIVE</span> : t.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
              <p className="text-arena-text-secondary text-sm">{t.game?.name} • {getFormatLabel(t.format)}</p>
            </div>
            {canRegister ? (
              <button onClick={() => setShowRegister(true)} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-arena-accent/20 text-sm whitespace-nowrap">
                Register Now
              </button>
            ) : registered ? (
              <span className={cn('px-4 py-2 rounded-xl text-sm font-medium', paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-warning/20 text-arena-warning')}>
                {paymentStatus === 'verified' ? '✓ Registered' : '⏳ Payment Pending'}
              </span>
            ) : !isAuthenticated ? (
              <button onClick={() => { toast.error('Please log in to register'); navigate('landing'); }} className="px-6 py-2.5 h-11 border border-arena-accent text-arena-accent font-semibold rounded-xl transition-all duration-200 text-sm">
                Login to Register
              </button>
            ) : null}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Entry Fee', value: paiseToRupee(t.entryFee), color: t.entryFee === 0 ? 'text-arena-success' : 'text-arena-accent' },
              { label: 'Prize Pool', value: paiseToRupee(t.prizePool), color: 'text-arena-gold' },
              { label: 'Format', value: getFormatLabel(t.format), color: '' },
              { label: 'Max Players', value: t.maxPlayers.toString(), color: '' },
            ].map(item => (
              <div key={item.label} className="bg-arena-surface rounded-xl p-3">
                <div className="text-[10px] text-arena-text-muted uppercase tracking-wider mb-1">{item.label}</div>
                <div className={cn('font-bold', item.color)}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Registration Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-arena-text-muted">{t.registeredPlayers || 0} Registered</span>
              <span className="text-arena-text-muted">{t.maxPlayers} Max</span>
            </div>
            <div className="w-full bg-arena-dark rounded-full h-2">
              <div className="bg-arena-accent rounded-full h-2 transition-all duration-300" style={{ width: `${Math.min(100, ((t.registeredPlayers || 0) / t.maxPlayers) * 100)}%` }} />
            </div>
          </div>

          {/* Date/Time */}
          <div className="flex flex-wrap gap-4 text-sm text-arena-text-secondary mb-4">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {t.startTime ? formatDateTime(t.startTime) : 'TBD'}</span>
            {t.map && <span className="flex items-center gap-1"><MonitorPlay className="w-4 h-4" /> Map: {t.map}</span>}
            {t.matchMode && <span className="flex items-center gap-1"><Gamepad2 className="w-4 h-4" /> {t.matchMode}</span>}
          </div>

          {/* Description */}
          {t.description && (
            <div className="border-t border-arena-border pt-4 mb-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-arena-text-secondary whitespace-pre-line">{t.description}</p>
            </div>
          )}

          {/* Custom Rules */}
          {t.customRules && (
            <div className="border-t border-arena-border pt-4 mb-4">
              <h3 className="font-semibold mb-2">Custom Rules</h3>
              <p className="text-sm text-arena-text-secondary whitespace-pre-line">{t.customRules}</p>
            </div>
          )}

          {/* Room Details (only for registered + verified) */}
          {registered && paymentStatus === 'verified' && (t.roomId || t.roomPassword) && (
            <div className="border-t border-arena-border pt-4 bg-arena-success/5 rounded-xl p-4">
              <h3 className="font-semibold text-arena-success mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Room Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {t.roomId && (
                  <div>
                    <div className="text-[10px] text-arena-text-muted uppercase">Room ID</div>
                    <div className="font-mono font-semibold flex items-center gap-2">{t.roomId} <Copy className="w-3 h-3 text-arena-text-muted cursor-pointer" onClick={() => { navigator.clipboard.writeText(t.roomId); toast.success('Copied!'); }} /></div>
                  </div>
                )}
                {t.roomPassword && (
                  <div>
                    <div className="text-[10px] text-arena-text-muted uppercase">Password</div>
                    <div className="font-mono font-semibold flex items-center gap-2">{t.roomPassword} <Copy className="w-3 h-3 text-arena-text-muted cursor-pointer" onClick={() => { navigator.clipboard.writeText(t.roomPassword); toast.success('Copied!'); }} /></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegister && (
        <RegistrationModal tournament={t} onRegister={handleRegister} onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}

function RegistrationModal({ tournament, onRegister, onClose }: { tournament: any; onRegister: (data: any) => void; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  if (tournament.entryFee === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-sm animate-fade-in-up" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-2">Confirm Registration</h3>
          <p className="text-sm text-arena-text-secondary mb-1">{tournament.title}</p>
          <p className="text-lg font-bold text-arena-success mb-4">FREE Entry</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-arena-border rounded-xl text-sm font-medium hover:border-white transition-colors duration-150">Cancel</button>
            <button onClick={() => onRegister({})} className="flex-1 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl text-sm font-semibold transition-all duration-200">Confirm</button>
          </div>
        </div>
      </div>
    );
  }

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const amount = tournament.entryFee; // already in paise
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          tournamentId: tournament.id,
          currency: 'INR',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Payment initialization failed');
        setLoading(false);
        return;
      }
      // Razorpay checkout
      const options: any = {
        key: data.razorpayKey || '',
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'Aether Arena',
        description: `Entry: ${tournament.title}`,
        order_id: data.orderId,
        handler: function (response: any) {
          onRegister({
            paymentMethod: 'razorpay',
            paymentReference: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#FF4B5C',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + (response.error.description || 'Unknown error'));
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error('Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-md animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Complete Payment</h3>
          <button onClick={onClose} aria-label="Close" className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-arena-surface rounded-xl p-4 mb-4">
          <p className="text-sm text-arena-text-secondary mb-1">{tournament.title}</p>
          <p className="text-2xl font-bold text-arena-accent">{paiseToRupee(tournament.entryFee)}</p>
        </div>
        <div className="mb-4 flex items-center gap-2 bg-arena-dark rounded-xl p-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.19l-.894 5.575C5.589 22.753 8.664 24 12.199 24c2.676 0 4.863-.624 6.462-1.855 1.687-1.297 2.555-3.162 2.555-5.584 0-4.163-2.525-5.897-7.24-7.411z"/></svg>
          </div>
          <div>
            <p className="text-sm font-medium">Secure Payment by Razorpay</p>
            <p className="text-xs text-arena-text-muted">Pay securely with UPI, Cards, or Wallets</p>
          </div>
        </div>
        <button onClick={handleRazorpayPayment} disabled={loading}
          className="w-full py-2.5 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <>Pay {paiseToRupee(tournament.entryFee)}</>
          )}
        </button>
      </div>
    </div>
  );
}
