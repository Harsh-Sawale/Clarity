import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoItem, PhotoStatus, StorageMetrics } from '../types';

const STORAGE_KEY_PHOTOS = '@clarity_photos_meta';
const STORAGE_KEY_METRICS = '@clarity_storage_metrics';

const PHOTOS_DIR = `${FileSystem.documentDirectory}clarity_photos/`;

async function ensureDirectoryExists(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

export async function getAllPhotos(): Promise<PhotoItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_PHOTOS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveAllPhotos(photos: PhotoItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
}

export async function getPhotosByStatus(status: PhotoStatus): Promise<PhotoItem[]> {
  const all = await getAllPhotos();
  return all
    .filter((p) => {
      if (status === 'active' || status === 'limbo') {
        return p.status === 'active' || p.status === 'limbo';
      }
      if (status === 'grace' || status === 'crypt') {
        return p.status === 'grace' || p.status === 'crypt';
      }
      if (status === 'keeper' || status === 'vault') {
        return p.status === 'keeper' || p.status === 'vault';
      }
      return p.status === status;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getUserGroups(): Promise<string[]> {
  const all = await getAllPhotos();
  const groupsSet = new Set<string>();
  all.forEach((p) => {
    if (p.groupName && p.groupName.trim()) {
      groupsSet.add(p.groupName.trim());
    }
  });
  return Array.from(groupsSet);
}

export async function saveCapturedPhoto(params: {
  tempUri: string;
  durationMs: number;
  groupName?: string;
  note?: string;
}): Promise<PhotoItem> {
  await ensureDirectoryExists();

  const id = `clarity_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const destinationUri = `${PHOTOS_DIR}${id}.jpg`;

  await FileSystem.copyAsync({
    from: params.tempUri,
    to: destinationUri,
  });

  let fileSizeBytes = 0;
  try {
    const info = await FileSystem.getInfoAsync(destinationUri);
    if (info.exists && info.size) {
      fileSizeBytes = info.size;
    }
  } catch {
    // Non-critical fallback
  }

  const now = Date.now();
  const newItem: PhotoItem = {
    id,
    uri: destinationUri,
    createdAt: now,
    durationMs: params.durationMs,
    expiresAt: now + params.durationMs,
    status: 'active',
    groupName: params.groupName,
    note: params.note,
    sizeBytes: fileSizeBytes,
  };

  const all = await getAllPhotos();
  all.unshift(newItem);
  await saveAllPhotos(all);

  return newItem;
}

export async function moveToKeepers(id: string): Promise<void> {
  const all = await getAllPhotos();
  const item = all.find((p) => p.id === id);
  if (item) {
    item.status = 'keeper';
    await saveAllPhotos(all);
  }
}

// Backward compatible alias
export const moveToVault = moveToKeepers;

export async function moveToGraceLounge(id: string, gracePeriodMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const all = await getAllPhotos();
  const item = all.find((p) => p.id === id);
  if (item) {
    item.status = 'grace';
    item.cryptExpiresAt = Date.now() + gracePeriodMs;
    await saveAllPhotos(all);
  }
}

// Backward compatible alias
export const moveToCrypt = moveToGraceLounge;

export async function resurrectFromGrace(id: string, extensionDurationMs: number = 2 * 60 * 60 * 1000): Promise<void> {
  const all = await getAllPhotos();
  const item = all.find((p) => p.id === id);
  if (item) {
    item.status = 'active';
    item.createdAt = Date.now();
    item.durationMs = extensionDurationMs;
    item.expiresAt = Date.now() + extensionDurationMs;
    item.cryptExpiresAt = undefined;
    await saveAllPhotos(all);
  }
}

// Backward compatible alias
export const resurrectFromCrypt = resurrectFromGrace;

export async function permanentlyDelete(id: string): Promise<void> {
  const all = await getAllPhotos();
  const targetIndex = all.findIndex((p) => p.id === id);
  if (targetIndex !== -1) {
    const item = all[targetIndex];
    try {
      const info = await FileSystem.getInfoAsync(item.uri);
      if (info.exists) {
        await FileSystem.deleteAsync(item.uri, { idempotent: true });
      }
    } catch {
      // Ignored
    }

    await recordReclaimedMetric(item.sizeBytes || 0);

    all.splice(targetIndex, 1);
    await saveAllPhotos(all);
  }
}

async function recordReclaimedMetric(bytes: number): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_METRICS);
    const metrics: { reclaimedCount: number; reclaimedBytes: number } = raw
      ? JSON.parse(raw)
      : { reclaimedCount: 0, reclaimedBytes: 0 };

    metrics.reclaimedCount += 1;
    metrics.reclaimedBytes += bytes;

    await AsyncStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(metrics));
  } catch {
    // Non-critical
  }
}

export async function getStorageMetrics(): Promise<StorageMetrics> {
  const all = await getAllPhotos();
  let reclaimedCount = 0;
  let reclaimedBytes = 0;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_METRICS);
    if (raw) {
      const parsed = JSON.parse(raw);
      reclaimedCount = parsed.reclaimedCount || 0;
      reclaimedBytes = parsed.reclaimedBytes || 0;
    }
  } catch {
    // Ignored
  }

  return {
    activeCount: all.filter((p) => p.status === 'active' || p.status === 'limbo').length,
    cryptCount: all.filter((p) => p.status === 'grace' || p.status === 'crypt').length,
    vaultCount: all.filter((p) => p.status === 'keeper' || p.status === 'vault').length,
    reclaimedCount,
    reclaimedBytes,
  };
}

export async function wipeAllData(): Promise<void> {
  try {
    await FileSystem.deleteAsync(PHOTOS_DIR, { idempotent: true });
    await ensureDirectoryExists();
    await AsyncStorage.removeItem(STORAGE_KEY_PHOTOS);
    await AsyncStorage.removeItem(STORAGE_KEY_METRICS);
  } catch {
    // Handled
  }
}
