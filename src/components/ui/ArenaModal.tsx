'use client';
import { useEffect, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArenaModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  showAccentBar?: boolean;
}

export function ArenaModal({ open, onClose, title, description, icon, size = 'md', children, showAccentBar = true }: ArenaModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, handleEsc]);

  if (!open) return null;

  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={cn('bg-arena-card border border-arena-border rounded-2xl w-full shadow-xl shadow-arena-accent/5 overflow-hidden animate-fade-in-up', sizeClasses[size])} onClick={e => e.stopPropagation()}>
        {showAccentBar && <div className="h-[3px] bg-gradient-to-r from-arena-accent via-arena-purple to-arena-accent" />}
        <div className="p-6">
          {(title || icon) && (
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {icon && <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center text-arena-accent flex-shrink-0">{icon}</div>}
                <div>
                  {title && <h3 className="text-lg font-bold">{title}</h3>}
                  {description && <p className="text-xs text-arena-text-secondary mt-0.5">{description}</p>}
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-arena-text-muted hover:text-white hover:bg-arena-surface transition-all duration-150" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
