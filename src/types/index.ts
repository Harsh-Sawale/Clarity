export type PhotoStatus = 'limbo' | 'crypt' | 'vault';

export type CategoryTag = 'parking' | 'receipt' | 'pass' | 'note';

export interface PhotoItem {
  id: string;
  uri: string;
  createdAt: number;
  durationMs: number;
  expiresAt: number;
  cryptExpiresAt?: number;
  status: PhotoStatus;
  tag?: CategoryTag;
  note?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

export interface AppSettings {
  defaultDurationMs: number;
  autoCompression: boolean;
  hapticsEnabled: boolean;
  theme: 'oled' | 'charcoal';
  gracePeriodHours: number;
}

export interface StorageMetrics {
  activeCount: number;
  cryptCount: number;
  vaultCount: number;
  reclaimedCount: number;
  reclaimedBytes: number;
}
