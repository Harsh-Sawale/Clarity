import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  defaultDurationMs: number;
  compressionQuality: number; // 0.6, 0.8, 1.0
  gracePeriodHours: number; // 12, 24, 48
  hapticsLevel: 'off' | 'soft' | 'crisp';
  aspectRatio: '4:3' | '16:9';
  showCountdownSeconds: boolean;
  defaultViewMode: 'list' | 'grid';
}

const SETTINGS_KEY = '@clarity_user_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  defaultDurationMs: 2 * 60 * 60 * 1000, // 2 hours
  compressionQuality: 0.85,
  gracePeriodHours: 24,
  hapticsLevel: 'crisp',
  aspectRatio: '4:3',
  showCountdownSeconds: false,
  defaultViewMode: 'list',
};

export async function loadUserSettings(): Promise<UserSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateUserSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const current = await loadUserSettings();
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
