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

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${info.color} ${sizeClasses[size]}`}
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
        <span className="text-xs text-gray-500">+{remainingCount}</span>
      )}
    </div>
  );
}
