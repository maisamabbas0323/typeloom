/**
 * Local-first client authentication and profile helpers.
 * Computes SHA-256 hashes in-browser so plain-text passwords
 * are never stored directly in localStorage.
 */

export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + '__typeloom_local_salt__');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Simple deterministic fallback for sandboxed environments
  let hash = 0;
  const str = password + '__typeloom_local_salt__';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'local_' + Math.abs(hash).toString(16);
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return 'TL';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const AVATAR_PALETTES = [
  { id: 'terracotta', label: 'Terracotta', bg: '#d47942', fg: '#ffffff' },
  { id: 'cobalt', label: 'Cobalt', bg: '#4e8cff', fg: '#ffffff' },
  { id: 'copper', label: 'Copper', bg: '#d97443', fg: '#ffffff' },
  { id: 'sage', label: 'Forest Sage', bg: '#68a37f', fg: '#ffffff' },
  { id: 'graphite', label: 'Graphite', bg: '#407093', fg: '#ffffff' },
  { id: 'burgundy', label: 'Burgundy', bg: '#a3485e', fg: '#ffffff' },
  { id: 'honey', label: 'Golden Honey', bg: '#cb872b', fg: '#ffffff' },
  { id: 'twilight', label: 'Twilight Indigo', bg: '#5b65ea', fg: '#ffffff' },
];

export function estimatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: 'Empty', color: 'var(--sub)' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || (/[A-Z]/.test(password) && /[a-z]/.test(password))) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: '#e25867' };
    case 2:
      return { score: 2, label: 'Fair', color: '#e5a158' };
    case 3:
      return { score: 3, label: 'Good', color: '#88b570' };
    case 4:
      return { score: 4, label: 'Strong', color: '#3ecf8e' };
    default:
      return { score: 0, label: 'Too Short', color: 'var(--sub)' };
  }
}
