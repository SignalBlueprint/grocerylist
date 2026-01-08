import { GroceryItem, Recipe, DietaryBadge } from '@/types';
import { groupByCategory, exportAsText } from './merge-engine';
import { detectDietaryBadges, getBadgeInfo } from './dietary-utils';

/**
 * Compresses grocery list data for URL sharing
 */
export function compressListData(items: GroceryItem[]): string {
  // Simple compression: store minimal data
  const minimal = items.map((item) => ({
    n: item.name,
    q: item.quantity,
    u: item.unit,
    c: item.category[0], // First letter of category
    k: item.checked ? 1 : 0,
  }));

  const json = JSON.stringify(minimal);
  // Base64 encode for URL safety
  return btoa(encodeURIComponent(json));
}

/**
 * Decompresses grocery list data from URL
 */
export function decompressListData(compressed: string): GroceryItem[] | null {
  try {
    const json = decodeURIComponent(atob(compressed));
    const minimal = JSON.parse(json) as Array<{
      n: string;
      q: number;
      u: string;
      c: string;
      k: number;
    }>;

    const categoryMap: Record<string, GroceryItem['category']> = {
      P: 'Produce',
      M: 'Meat',
      D: 'Dairy',
      a: 'Pantry', // 'P' is taken by Produce
      F: 'Frozen',
      S: 'Spices',
      O: 'Other',
    };

    return minimal.map((item, index) => ({
      id: `shared-${index}`,
      name: item.n,
      quantity: item.q,
      unit: item.u,
      category: categoryMap[item.c] || 'Other',
      checked: item.k === 1,
      sourceRecipes: ['Shared'],
    }));
  } catch {
    return null;
  }
}

/**
 * Generates a shareable URL for the grocery list
 */
export function generateShareUrl(items: GroceryItem[]): string {
  const compressed = compressListData(items);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}?list=${compressed}`;
}

/**
 * Parses a shared list from URL parameters
 */
export function parseShareUrl(url: string): GroceryItem[] | null {
  try {
    const urlObj = new URL(url);
    const listParam = urlObj.searchParams.get('list');
    if (!listParam) return null;
    return decompressListData(listParam);
  } catch {
    return null;
  }
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Shares content using Web Share API if available
 */
export async function shareContent(options: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(options);
      return true;
    } catch (err) {
      // User cancelled or error
      return false;
    }
  }
  return false;
}

/**
 * Generates a data URL for a QR code (using a simple SVG approach)
 * For production, you might want to use a library like qrcode
 */
export function generateQRCodeUrl(data: string): string {
  // Using a free QR code API - for production, consider self-hosting
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
}

/**
 * Gets dietary badges that are common to ALL recipes in the list
 */
export function getCommonDietaryBadges(recipes: Recipe[]): DietaryBadge[] {
  if (recipes.length === 0) return [];

  // Get badges for each recipe
  const allBadges = recipes.map(recipe => new Set(detectDietaryBadges(recipe.ingredients)));

  // Find intersection of all badge sets
  const firstBadges = allBadges[0];
  const commonBadges: DietaryBadge[] = [];

  firstBadges.forEach(badge => {
    if (allBadges.every(badges => badges.has(badge))) {
      commonBadges.push(badge);
    }
  });

  return commonBadges;
}

/**
 * Generates a share title with dietary information
 */
export function generateShareTitle(recipes: Recipe[], itemCount: number): string {
  const commonBadges = getCommonDietaryBadges(recipes);

  let title = `Grocery List (${itemCount} items)`;

  if (commonBadges.length > 0) {
    // Show most relevant dietary badges (max 2)
    const displayBadges = commonBadges.slice(0, 2);
    const badgeLabels = displayBadges.map(badge => getBadgeInfo(badge).label);
    title = `${badgeLabels.join(' & ')} ${title}`;
  }

  return title;
}

/**
 * Generates share text with dietary summary and recipe list
 */
export function generateShareText(recipes: Recipe[], itemCount: number): string {
  const commonBadges = getCommonDietaryBadges(recipes);
  const title = generateShareTitle(recipes, itemCount);

  let text = title + '\n';

  if (commonBadges.length > 0) {
    const badgeIcons = commonBadges.map(badge => getBadgeInfo(badge).icon).join(' ');
    text += badgeIcons + '\n';
  }

  text += '\nRecipes:\n';
  recipes.forEach(recipe => {
    text += `- ${recipe.name}\n`;
  });

  return text;
}
