export type PhotoStatus = 'active' | 'grace' | 'keeper' | 'limbo' | 'crypt' | 'vault';

export interface PhotoItem {
  id: string;
  uri: string;
  createdAt: number;
  durationMs: number;
  expiresAt: number;
  cryptExpiresAt?: number;
  status: PhotoStatus;
  groupName?: string;
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
