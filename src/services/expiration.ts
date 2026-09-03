import { getAllPhotos, moveToGraceLounge, permanentlyDelete } from './storage';

export async function runLifecycleSweep(): Promise<{ sweptToGrace: number; permanentlyPurged: number }> {
  const all = await getAllPhotos();
  const now = Date.now();
  let sweptToGrace = 0;
  let permanentlyPurged = 0;

  for (const item of all) {
    if (item.status === 'active' || item.status === 'limbo') {
      if (now >= item.expiresAt) {
        await moveToGraceLounge(item.id);
        sweptToGrace++;
      }
    } else if (item.status === 'grace' || item.status === 'crypt') {
      if (item.cryptExpiresAt && now >= item.cryptExpiresAt) {
        await permanentlyDelete(item.id);
        permanentlyPurged++;
      }
    }
  }

  return { sweptToGrace, permanentlyPurged };
}

export function calculateLifespanProgress(createdAt: number, expiresAt: number): number {
  const total = expiresAt - createdAt;
  if (total <= 0) return 0;
  const elapsed = Date.now() - createdAt;
  return Math.max(0, Math.min(1, 1 - elapsed / total));
}

export function formatRemainingTime(expiresAt: number): string {
  const remainingMs = expiresAt - Date.now();
  if (remainingMs <= 0) return 'Expired';

  const totalMinutes = Math.floor(remainingMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s left`;
  }
  return `${seconds}s left`;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, index);
  return `${val.toFixed(1)} ${units[index]}`;
}
