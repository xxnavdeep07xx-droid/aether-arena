'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Gamepad2, Users, DollarSign, Swords } from 'lucide-react';

interface TournamentFiltersProps {
  game?: string;
  status?: string;
  format?: string;
  fee?: string;
  onGameChange?: (game: string) => void;
  onStatusChange?: (status: string) => void;
  onFormatChange?: (format: string) => void;
  onFeeChange?: (fee: string) => void;
}

const games = ['All', 'Free Fire', 'BGMI', 'COD', 'Minecraft', 'Pokemon Go'];
const statuses = ['All', 'Upcoming', 'Open', 'LIVE', 'Completed'];
const formats = ['All', 'Solo', 'Duo', 'Squad'];
const fees = ['All', 'Free', 'Paid'];

export function TournamentFilters({
  game = 'All',
  status = 'All',
  format = 'All',
  fee = 'All',
  onGameChange,
  onStatusChange,
  onFormatChange,
  onFeeChange,
}: TournamentFiltersProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-3">
      {/* Primary filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Game filters */}
        {games.map((g) => (
          <FilterButton
            key={g}
            label={g}
            icon={g === 'All' ? Gamepad2 : undefined}
            active={game === g}
            onClick={() => onGameChange?.(g)}
          />
        ))}
      </div>

      {/* Extended filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status */}
        <FilterDropdown
          label="Status"
          icon={Users}
          options={statuses}
          value={status}
          onChange={onStatusChange}
        />

        {/* Format */}
        <FilterDropdown
          label="Format"
          icon={Swords}
          options={formats}
          value={format}
          onChange={onFormatChange}
        />

        {/* Fee */}
        <FilterDropdown
          label="Fee"
          icon={DollarSign}
          options={fees}
          value={fee}
          onChange={onFeeChange}
        />
      </div>
    </div>
  );
}

function FilterButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon?: typeof Gamepad2;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border',
        active
          ? 'bg-arena-accent text-white border-arena-accent shadow-md shadow-arena-accent/20'
          : 'bg-arena-card text-arena-text-secondary border-arena-border hover:border-arena-accent/30 hover:text-arena-text-primary'
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

function FilterDropdown({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: typeof Gamepad2;
  options: string[];
  value: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1 text-arena-text-muted">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange?.(opt)}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all',
              value === opt
                ? 'bg-arena-accent text-white'
                : 'bg-arena-card text-arena-text-secondary border border-arena-border hover:border-arena-accent/30'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
