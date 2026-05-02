'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star, CircleDot, Calendar, MonitorPlay, Gamepad2,
  Shield, Copy, CheckCircle2, Smartphone, Clock, AlertCircle, ChevronRight
} from 'lucide-react';
import { ArenaModal } from '@/components/ui/ArenaModal';
import { cn, paiseToRupee, getStatusBg, getFormatLabel, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { TournamentDetailSkeleton } from './Skeletons';

export function TournamentDetailView() {
  const { viewParams, navigate } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', viewParams.id],
    queryFn: () => apiFetch<any>(`/api/tournaments/${viewParams.id}`).then(d => {
      // Only return if it looks like a valid tournament (has a status field)
      if (!d || d.error || !d.status) return null;
      return d;
    }).catch(() => null),
    enabled: !!viewParams.id,
  });

  useEffect(() => {
    if (!tournament || !isAuthenticated) return;
    const checkRegistration = async () => {
      try {
        const data = await apiFetch<any>('/api/registrations');
        const regs = Array.isArray(data.registrations) ? data.registrations : Array.isArray(data) ? data : [];
        const existing = regs.find((r: any) => r.tournamentId === viewParams.id);
        if (existing) { setRegistered(true); setPaymentStatus(existing.paymentStatus); }
      } catch {}
    };
    checkRegistration();
  }, [tournament, isAuthenticated, viewParams.id]);

  const handleRegister = async (data: { paymentMethod?: string; paymentReference?: string }) => {
    try {
      const result = await apiFetch<{ registration?: { paymentStatus?: string } }>(`/api/tournaments/${viewParams.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setRegistered(true);
      setPaymentStatus(result.registration?.paymentStatus || 'pending');
      setShowRegister(false);
      toast.success(tournament.entryFee === 0 ? 'Registered successfully!' : 'Payment submitted! Waiting for verification.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  if (isLoading) return <TournamentDetailSkeleton />;
  if (!tournament) return <div className="text-center py-20 text-arena-text-muted">Tournament not found</div>;

  const t = tournament;
  const canRegister = isAuthenticated && t?.status === 'registration_open' && (t.registeredPlayers || 0) < t.maxPlayers && !registered;

  return (
    <div>
      {/* Header */}
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-arena-accent/20 via-arena-purple/15 to-arena-surface flex items-center justify-center relative">
          <Gamepad2 className="w-16 h-16 text-arena-text-muted/30" />
          <div className="absolute top-4 left-4 flex gap-2">
            {t.isFeatured && <span className="bg-arena-gold/20 text-arena-gold text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
            <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', getStatusBg(t?.status))}>
              {t?.status === 'in_progress' ? <span className="flex items-center gap-1"><CircleDot className="w-3 h-3 animate-pulse" /> LIVE</span> : t?.status ? t.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''}
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
  const [utr, setUtr] = useState('');
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0=instructions, 1=payment proof, 2=submitted
  const { isAuthenticated } = useAuthStore();

  // Fetch GPay number from public platform settings (no admin auth required)
  const { data: settings } = useQuery({
    queryKey: ['platform-settings-public'],
    queryFn: () => fetch('/api/settings/public').then(r => r.ok ? r.json() : {}).then((d: Record<string, any>) => d.settings || {}),
  });

  const gpayNumber = (settings as Record<string, string>)?.gpay_number || '9158396121';

  if (tournament.entryFee === 0) {
    return (
      <ArenaModal open={true} onClose={onClose} title="Confirm Registration" description={tournament.title} icon={<CheckCircle2 className="w-5 h-5" />} size="sm">
        <p className="text-lg font-bold text-arena-success mb-4">FREE Entry</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-arena-border rounded-xl text-sm font-medium hover:border-arena-text-primary transition-colors duration-150">Cancel</button>
          <button onClick={() => onRegister({})} className="flex-1 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl text-sm font-semibold transition-all duration-200">Confirm</button>
        </div>
      </ArenaModal>
    );
  }

  const handleGpaySubmit = async () => {
    if (!utr.trim()) {
      toast.error('Please enter the UTR / Transaction Reference number');
      return;
    }
    setLoading(true);
    try {
      await onRegister({
        paymentMethod: 'gpay',
        paymentReference: utr.trim(),
      });
      setStep(2);
    } catch {
      toast.error('Failed to submit payment proof');
    }
    setLoading(false);
  };

  return (
    <ArenaModal open={true} onClose={onClose} title="Complete Payment" description={tournament.title} icon={
      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
        <Smartphone className="w-5 h-5 text-green-400" />
      </div>
    } size="md">
      {step === 0 && (
        <div className="space-y-4 animate-fade-in">
          {/* Amount */}
          <div className="bg-arena-surface rounded-xl p-4">
            <p className="text-xs text-arena-text-muted mb-1">Entry Fee</p>
            <p className="text-2xl font-bold text-arena-accent">{paiseToRupee(tournament.entryFee)}</p>
          </div>

          {/* Razorpay Coming Soon */}
          <div className="flex items-center gap-3 bg-arena-dark rounded-xl p-3 border border-arena-border/50">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.19l-.894 5.575C5.589 22.753 8.664 24 12.199 24c2.676 0 4.863-.624 6.462-1.855 1.687-1.297 2.555-3.162 2.555-5.584 0-4.163-2.525-5.897-7.24-7.411z"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Razorpay</p>
              <p className="text-xs text-arena-text-muted">Online payment gateway</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-arena-warning/15 text-arena-warning">Coming Soon</span>
          </div>

          {/* GPay Payment Option - UPI Deep Link */}
          <div className="border border-green-500/30 rounded-xl p-4 bg-green-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Pay via Google Pay</span>
            </div>
            <p className="text-xs text-arena-text-secondary mb-4 leading-relaxed">
              Click the button below to open Google Pay with the exact amount pre-filled. Complete the payment, then come back and enter your UTR number.
            </p>

            {/* UPI Pay Button */}
            <a
              href={`upi://pay?pa=${gpayNumber}@upi&pn=Aether%20Arena&am=${(tournament.entryFee / 100).toFixed(2)}&cu=INR&tn=Aether%20Arena%20Tournament`}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 mb-3"
            >
              <Smartphone className="w-4 h-4" />
              Open Google Pay to Pay {paiseToRupee(tournament.entryFee)}
            </a>

            {/* Desktop fallback note */}
            <div className="flex items-start gap-2 text-xs text-arena-text-muted bg-arena-dark rounded-lg p-3">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-arena-info" />
              <span>
                On mobile, tapping the button above will open Google Pay directly. 
                On desktop, send the exact amount <strong className="text-arena-text-primary">{paiseToRupee(tournament.entryFee)}</strong> via Google Pay from your phone.
              </span>
            </div>

            {/* Important Note */}
            <div className="flex items-start gap-2 text-xs text-arena-warning mt-3">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Send exactly <strong>{paiseToRupee(tournament.entryFee)}</strong>. Payments with incorrect amounts may be rejected.</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-arena-border rounded-xl text-sm font-medium hover:border-arena-text-primary transition-colors duration-150">Cancel</button>
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2">
              I&apos;ve Completed Payment <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-arena-text-secondary mb-2">
            <Clock className="w-4 h-4 text-arena-warning" />
            <span>Your registration is pending payment verification</span>
          </div>

          <div>
            <label className="text-[13px] font-medium text-arena-text-primary/80 mb-1.5 block">
              UTR / Transaction Reference <span className="text-arena-accent">*</span>
            </label>
            <input
              type="text"
              required
              value={utr}
              onChange={e => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30))}
              className="w-full bg-arena-surface/50 border border-arena-border/60 rounded-xl text-sm text-arena-text-primary placeholder:text-arena-text-muted/40 focus:outline-none focus:border-arena-accent/70 focus:ring-2 focus:ring-arena-accent/10 transition-all duration-200 px-4 py-3 h-12"
              placeholder="Enter 12-digit UTR number"
              autoFocus
            />
            <p className="text-[11px] text-arena-text-muted/60 mt-1">
              Find this in your Google Pay transaction history or bank statement
            </p>
          </div>

          <div className="bg-arena-surface rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-arena-info flex-shrink-0" />
            <p className="text-xs text-arena-text-secondary">
              Admin will verify your payment within <strong>15-30 minutes</strong>. You&apos;ll get a notification once confirmed.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="px-6 py-2.5 h-11 border border-arena-border rounded-xl text-sm font-medium hover:border-arena-text-primary transition-colors duration-150">Back</button>
            <button onClick={handleGpaySubmit} disabled={loading || !utr.trim()}
              className="flex-1 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <span className="animate-pulse">Submitting...</span> : 'Submit Payment Proof'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-bold">Payment Proof Submitted!</h3>
          <p className="text-sm text-arena-text-secondary">
            Your payment is being verified. You&apos;ll receive a notification once it&apos;s confirmed.
          </p>
          <p className="text-xs text-arena-text-muted">
            This usually takes 15-30 minutes during active hours.
          </p>
          <button onClick={onClose} className="mt-2 px-8 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm">
            Done
          </button>
        </div>
      )}
    </ArenaModal>
  );
}
