'use client';

import { useState } from 'react';
import { paiseToRupee } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  CreditCard,
  Image as ImageIcon,
} from 'lucide-react';

interface PaymentVerifyRowProps {
  registration: {
    id: string;
    playerName: string;
    playerAvatarUrl?: string;
    playerUsername: string;
    tournamentTitle: string;
    paidAmount: number;
    paymentMethod: string;
    paymentReference?: string;
    paymentScreenshotUrl?: string;
    createdAt: string;
  };
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

export function PaymentVerifyRow({
  registration,
  onVerify,
  onReject,
  isProcessing = false,
}: PaymentVerifyRowProps) {
  const [showScreenshot, setShowScreenshot] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-arena-card border border-arena-border hover:border-arena-border/80 transition-colors">
        {/* Player info */}
        <div className="flex items-center gap-3 min-w-0 sm:w-48 shrink-0">
          {registration.playerAvatarUrl ? (
            <img
              src={registration.playerAvatarUrl}
              alt={registration.playerName}
              className="w-9 h-9 rounded-full object-cover border border-arena-border shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-arena-accent/20 flex items-center justify-center text-xs font-bold text-arena-accent shrink-0">
              {registration.playerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-arena-text-primary truncate">
              {registration.playerName}
            </p>
            <p className="text-[10px] text-arena-text-muted">
              @{registration.playerUsername}
            </p>
          </div>
        </div>

        {/* Tournament */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-arena-text-secondary truncate">
            {registration.tournamentTitle}
          </p>
        </div>

        {/* Amount */}
        <div className="shrink-0">
          <span className="text-sm font-bold text-arena-accent">
            {paiseToRupee(registration.paidAmount)}
          </span>
        </div>

        {/* Payment method */}
        <div className="shrink-0">
          <Badge
            variant="outline"
            className="border-arena-border text-arena-text-secondary text-xs rounded-lg px-2 py-0.5"
          >
            <CreditCard className="w-3 h-3 mr-1" />
            {registration.paymentMethod || 'UPI'}
          </Badge>
        </div>

        {/* Reference */}
        {registration.paymentReference && (
          <div className="hidden lg:block shrink-0">
            <p className="text-xs text-arena-text-muted font-mono truncate max-w-[120px]">
              {registration.paymentReference}
            </p>
          </div>
        )}

        {/* Screenshot */}
        {registration.paymentScreenshotUrl && (
          <button
            onClick={() => setShowScreenshot(true)}
            className="shrink-0 w-9 h-9 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center text-arena-text-muted hover:text-arena-info hover:border-arena-info/30 transition-colors"
            title="View screenshot"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => onVerify(registration.id)}
            disabled={isProcessing}
            className="h-8 px-3 bg-arena-success/20 text-arena-success hover:bg-arena-success/30 rounded-lg gap-1.5 text-xs"
          >
            <Check className="w-3.5 h-3.5" />
            Verify
          </Button>
          <Button
            size="sm"
            onClick={() => onReject(registration.id)}
            disabled={isProcessing}
            className="h-8 px-3 bg-arena-accent/20 text-arena-accent hover:bg-arena-accent/30 rounded-lg gap-1.5 text-xs"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </Button>
        </div>
      </div>

      {/* Screenshot modal */}
      {showScreenshot && registration.paymentScreenshotUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowScreenshot(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-arena-card border border-arena-border rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-arena-border flex items-center justify-between">
              <p className="text-sm font-medium text-arena-text-primary">Payment Screenshot</p>
              <button
                onClick={() => setShowScreenshot(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-arena-text-muted hover:text-arena-text-primary hover:bg-arena-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={registration.paymentScreenshotUrl}
                alt="Payment screenshot"
                className="w-full rounded-xl object-contain max-h-[70vh]"
              />
              {registration.paymentReference && (
                <p className="mt-3 text-xs text-arena-text-muted text-center font-mono">
                  Ref: {registration.paymentReference}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
