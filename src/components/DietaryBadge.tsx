'use client';

import { DietaryBadge as DietaryBadgeType } from '@/types';
import { getBadgeInfo } from '@/lib/dietary-utils';

interface DietaryBadgeProps {
  badge: DietaryBadgeType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function DietaryBadge({ badge, showLabel = false, size = 'sm' }: DietaryBadgeProps) {
  const info = getBadgeInfo(badge);

  const sizePadding = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.375rem 0.625rem', fontSize: '0.875rem' },
  };

  return (
    <span
      className="inline-flex items-center gap-1 font-medium"
      style={{
        ...sizePadding[size],
        ...info.customStyle,
        borderRadius: 'var(--radius-full)',
        border: '1px solid',
        lineHeight: 1.2,
      }}
      title={info.label}
    >
      <span className="leading-none">{info.icon}</span>
      {showLabel && <span>{info.label}</span>}
    </span>
  );
}

interface DietaryBadgeListProps {
  badges: DietaryBadgeType[];
  showLabels?: boolean;
  size?: 'sm' | 'md';
  maxDisplay?: number;
}

export function DietaryBadgeList({
  badges,
  showLabels = false,
  size = 'sm',
  maxDisplay,
}: DietaryBadgeListProps) {
  if (badges.length === 0) return null;

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay ? Math.max(0, badges.length - maxDisplay) : 0;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {displayBadges.map((badge) => (
        <DietaryBadge key={badge} badge={badge} showLabel={showLabels} size={size} />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
