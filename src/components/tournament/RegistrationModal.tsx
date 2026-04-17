'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { paiseToRupee } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Check, Copy, ArrowRight } from 'lucide-react';

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: {
    id: string;
    title: string;
    entryFee: number;
    format: string;
    maxPlayers: number;
    registeredPlayers: number;
  };
}

export function RegistrationModal({ open, onOpenChange, tournament }: RegistrationModalProps) {
  const isFree = tournament.entryFee === 0;
  const [step, setStep] = useState<'confirm' | 'payment'>('confirm');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const UPI_ID = 'aetherarena@upi';
  const spotsLeft = tournament.maxPlayers - tournament.registeredPlayers;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tournamentId', tournament.id);
      formData.append('transactionId', transactionId);
      if (screenshot) formData.append('screenshot', screenshot);

      const res = await fetch('/api/tournaments/register', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Handle error
    }
    setIsSubmitting(false);
  };

  const handleFreeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tournaments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: tournament.id }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Handle error
    }
    setIsSubmitting(false);
  };

  const resetAndClose = () => {
    setStep('confirm');
    setTransactionId('');
    setScreenshot(null);
    setSubmitted(false);
    onOpenChange(false);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="bg-arena-card border-arena-border text-arena-text-primary max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-arena-accent via-arena-purple to-arena-accent" />

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-arena-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-arena-success" />
              </div>
              <h3 className="text-lg font-bold text-arena-text-primary">
                {isFree ? 'Registered Successfully!' : 'Payment Submitted!'}
              </h3>
              <p className="text-sm text-arena-text-secondary mt-2">
                {isFree
                  ? 'You\'re all set. Get ready for the tournament!'
                  : 'Your payment is being verified. You\'ll be notified once confirmed.'}
              </p>
              <Button
                onClick={resetAndClose}
                className="mt-6 bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl"
              >
                Close
              </Button>
            </div>
          ) : isFree ? (
            /* Free tournament flow */
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-arena-text-primary">
                  Confirm Registration
                </DialogTitle>
                <DialogDescription className="text-arena-text-secondary">
                  Join this tournament for free
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                <div className="p-4 rounded-xl bg-arena-surface border border-arena-border space-y-2">
                  <p className="font-semibold text-arena-text-primary">{tournament.title}</p>
                  <div className="flex items-center gap-4 text-xs text-arena-text-secondary">
                    <span>Format: {tournament.format}</span>
                    <span>Fee: <span className="text-arena-success font-semibold">FREE</span></span>
                  </div>
                  <p className="text-xs text-arena-text-muted">
                    {spotsLeft} spots remaining
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={resetAndClose}
                  className="flex-1 border-arena-border text-arena-text-secondary hover:text-arena-text-primary rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFreeSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl"
                >
                  {isSubmitting ? 'Registering...' : 'Register Now'}
                </Button>
              </div>
            </div>
          ) : (
            /* Paid tournament flow */
            <div>
              {step === 'confirm' ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-arena-text-primary">
                      Confirm Registration
                    </DialogTitle>
                    <DialogDescription className="text-arena-text-secondary">
                      Complete payment to join
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 space-y-3">
                    <div className="p-4 rounded-xl bg-arena-surface border border-arena-border space-y-2">
                      <p className="font-semibold text-arena-text-primary">{tournament.title}</p>
                      <div className="flex items-center gap-4 text-xs text-arena-text-secondary">
                        <span>Format: {tournament.format}</span>
                        <span>Fee: <span className="text-arena-accent font-semibold">{paiseToRupee(tournament.entryFee)}</span></span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-arena-warning/10 border border-arena-warning/20">
                      <p className="text-sm text-arena-warning font-medium">
                        ⚠️ Entry Fee: {paiseToRupee(tournament.entryFee)}
                      </p>
                      <p className="text-xs text-arena-text-secondary mt-1">
                        You&apos;ll be redirected to payment instructions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={resetAndClose}
                      className="flex-1 border-arena-border text-arena-text-secondary hover:text-arena-text-primary rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setStep('payment')}
                      className="flex-1 bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl gap-2"
                    >
                      Continue to Pay
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-arena-text-primary">
                      Payment Details
                    </DialogTitle>
                    <DialogDescription className="text-arena-text-secondary">
                      Send payment and submit proof
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    {/* UPI Details */}
                    <div className="p-4 rounded-xl bg-arena-surface border border-arena-border">
                      <p className="text-xs text-arena-text-muted uppercase tracking-wide font-medium mb-2">
                        Pay to UPI ID
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-base font-mono font-bold text-arena-accent bg-arena-dark px-3 py-2 rounded-lg">
                          {UPI_ID}
                        </code>
                        <button
                          onClick={copyUpiId}
                          className="w-9 h-9 rounded-lg bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-muted hover:text-arena-text-primary hover:border-arena-accent/30 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-arena-text-primary mt-2">
                        Amount: {paiseToRupee(tournament.entryFee)}
                      </p>
                      <p className="text-[11px] text-arena-text-muted mt-1">
                        Include your username as the payment remark
                      </p>
                    </div>

                    {/* Transaction ID */}
                    <div className="space-y-2">
                      <label className="text-xs text-arena-text-muted uppercase tracking-wide font-medium">
                        Transaction ID / UTR
                      </label>
                      <Input
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="bg-arena-surface border-arena-border rounded-xl text-sm text-arena-text-primary placeholder:text-arena-text-muted"
                      />
                    </div>

                    {/* Screenshot upload */}
                    <div className="space-y-2">
                      <label className="text-xs text-arena-text-muted uppercase tracking-wide font-medium">
                        Payment Screenshot
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                          screenshot
                            ? 'border-arena-success bg-arena-success/5'
                            : 'border-arena-border hover:border-arena-accent/30'
                        )}>
                          <Upload className="w-5 h-5 text-arena-text-muted" />
                          {screenshot ? (
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-arena-success font-medium">{screenshot.name}</p>
                              <p className="text-xs text-arena-text-muted">{(screenshot.size / 1024).toFixed(1)} KB</p>
                            </div>
                          ) : (
                            <p className="text-sm text-arena-text-muted">Click to upload screenshot</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep('confirm')}
                      className="border-arena-border text-arena-text-secondary hover:text-arena-text-primary rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !transactionId}
                      className="flex-1 bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl gap-2"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Payment'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
