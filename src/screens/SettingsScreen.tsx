import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';
import { GlassButton } from '../components/GlassButton';
import { MAINTAINER_CONFIG } from '../config/maintainer';
import {
  UserSettings,
  DEFAULT_SETTINGS,
  loadUserSettings,
  updateUserSettings,
} from '../services/settings';
import { wipeAllData, getStorageMetrics } from '../services/storage';
import { formatBytes } from '../services/expiration';
import { StorageMetrics } from '../types';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [metrics, setMetrics] = useState<StorageMetrics>({
    activeCount: 0,
    cryptCount: 0,
    vaultCount: 0,
    reclaimedCount: 0,
    reclaimedBytes: 0,
  });

  useEffect(() => {
    loadUserSettings().then(setSettings);
    getStorageMetrics().then(setMetrics);
  }, []);

  const handleUpdate = async (partial: Partial<UserSettings>) => {
    const updated = await updateUserSettings(partial);
    setSettings(updated);
  };

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Link', url);
    }
  };

  const handleNuclearWipe = () => {
    Alert.alert(
      'Nuclear Wipeout',
      'This will irreversibly wipe all temporary photos, keepers, and safety lounge data from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: async () => {
            await wipeAllData();
            const refreshed = await getStorageMetrics();
            setMetrics(refreshed);
            Alert.alert('Device Wiped', 'All scratchpad storage has been physically unlinked.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Clear Back Navigation */}
      <View style={styles.header}>
        <GlassButton
          title="< BACK"
          size="md"
          onPress={onBack}
          style={styles.backBtn}
        />
        <View style={styles.headerTitles}>
          <Text style={styles.title}>SETTINGS & TWEAKS</Text>
          <Text style={styles.subtitle}>Customize your camera, timers, and storage</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Default Timer */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DEFAULT AUTO-DELETE TIMER</Text>
          <Text style={styles.cardHelp}>The lifespan automatically picked whenever you snap a photo.</Text>
          <View style={styles.pillsRow}>
            {[
              { label: '15M', val: 15 * 60 * 1000 },
              { label: '30M', val: 30 * 60 * 1000 },
              { label: '2H', val: 2 * 60 * 60 * 1000 },
              { label: '6H', val: 6 * 60 * 60 * 1000 },
              { label: '24H', val: 24 * 60 * 60 * 1000 },
            ].map((item) => (
              <GlassButton
                key={item.label}
                title={item.label}
                size="sm"
                isActive={settings.defaultDurationMs === item.val}
                onPress={() => handleUpdate({ defaultDurationMs: item.val })}
                style={styles.pillBtn}
              />
            ))}
          </View>
        </View>

        {/* Section 2: Trash Recovery Window */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TRASH RECOVERY WINDOW</Text>
          <Text style={styles.cardHelp}>
            How long expired photos stay in the trash before being permanently erased from your phone.
          </Text>
          <View style={styles.pillsRow}>
            {[
              { label: '12 HOURS', val: 12 },
              { label: '24 HOURS', val: 24 },
              { label: '48 HOURS', val: 48 },
            ].map((item) => (
              <GlassButton
                key={item.label}
                title={item.label}
                size="sm"
                isActive={settings.gracePeriodHours === item.val}
                onPress={() => handleUpdate({ gracePeriodHours: item.val })}
                style={styles.pillBtn}
              />
            ))}
          </View>
        </View>

        {/* Section 3: Camera Optics */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CAMERA SENSOR RATIO</Text>
          <Text style={styles.cardHelp}>
            4:3 uses the standard optical lens with no wide-angle distortion. 16:9 fills the full screen.
          </Text>
          <View style={styles.pillsRow}>
            {[
              { label: '4:3 OPTICAL', val: '4:3' as const },
              { label: '16:9 FULLSCREEN', val: '16:9' as const },
            ].map((item) => (
              <GlassButton
                key={item.label}
                title={item.label}
                size="sm"
                isActive={settings.aspectRatio === item.val}
                onPress={() => handleUpdate({ aspectRatio: item.val })}
                style={styles.pillBtn}
              />
            ))}
          </View>
        </View>

        {/* Section 4: Compression */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PHOTO QUALITY & STORAGE SAVING</Text>
          <Text style={styles.cardHelp}>
            Balanced saves phone space while keeping receipts and text pin-sharp.
          </Text>
          <View style={styles.pillsRow}>
            {[
              { label: 'COMPACT (65%)', val: 0.65 },
              { label: 'BALANCED (85%)', val: 0.85 },
              { label: 'MAX (100%)', val: 1.0 },
            ].map((item) => (
              <GlassButton
                key={item.label}
                title={item.label}
                size="sm"
                isActive={settings.compressionQuality === item.val}
                onPress={() => handleUpdate({ compressionQuality: item.val })}
                style={styles.pillBtn}
              />
            ))}
          </View>
        </View>

        {/* Section 5: Haptics */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>HAPTIC VIBRATION</Text>
          <Text style={styles.cardHelp}>Physical vibration click when tapping buttons and the shutter.</Text>
          <View style={styles.pillsRow}>
            {[
              { label: 'OFF', val: 'off' as const },
              { label: 'SOFT', val: 'soft' as const },
              { label: 'CRISP', val: 'crisp' as const },
            ].map((item) => (
              <GlassButton
                key={item.label}
                title={item.label}
                size="sm"
                isActive={settings.hapticsLevel === item.val}
                onPress={() => handleUpdate({ hapticsLevel: item.val })}
                style={styles.pillBtn}
              />
            ))}
          </View>
        </View>

        {/* Section 6: Reclaimed Storage */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerCardLabel}>STORAGE RECLAIMED & RESET</Text>
          <View style={styles.metricRow}>
            <View>
              <Text style={styles.metricBig}>{metrics.reclaimedCount}</Text>
              <Text style={styles.metricSub}>Auto-Cleaned</Text>
            </View>
            <View style={styles.metricDivider} />
            <View>
              <Text style={styles.metricBig}>{formatBytes(metrics.reclaimedBytes)}</Text>
              <Text style={styles.metricSub}>Space Saved</Text>
            </View>
          </View>
          <GlassButton
            title="WIPE ALL STORAGE & RESET"
            size="md"
            onPress={handleNuclearWipe}
            style={styles.nuclearBtn}
          />
        </View>

        {/* Section 7: Authentic Creator Story */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ABOUT THE DEVELOPER</Text>
          <Text style={styles.authorName}>Harsh Sawale</Text>
          <Text style={styles.authorBio}>
            I built Clarity because my phone was constantly running out of cloud storage from receipts, parking tickets, and Wi-Fi stickers that I only needed for 20 minutes. Clarity keeps temporary photos 100% offline, out of your main camera roll, and deletes them automatically when you're done. No ads, no cloud sync, and 100% open source.
          </Text>
          <View style={styles.linkRow}>
            <GlassButton
              title="SOURCE CODE ON GITHUB"
              size="sm"
              isActive
              onPress={() => openUrl(MAINTAINER_CONFIG.repositoryUrl)}
              style={styles.linkBtn}
            />
            <GlassButton
              title="GITHUB PROFILE"
              size="sm"
              onPress={() => openUrl(`https://github.com/${MAINTAINER_CONFIG.githubUsername}`)}
              style={styles.linkBtn}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: statusBarHeight + 10,
    paddingBottom: 14,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#0C0C0E',
    borderBottomWidth: 1,
    borderBottomColor: '#202024',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    minWidth: 80,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#121216',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24242C',
    padding: 14,
    gap: 10,
  },
  cardLabel: {
    ...Typography.badge,
    fontSize: 10,
    color: '#A1A1AA',
    letterSpacing: 0.8,
  },
  cardHelp: {
    fontSize: 12,
    color: '#71717A',
    lineHeight: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pillBtn: {
    flex: 1,
  },
  dangerCard: {
    backgroundColor: '#160E0E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#381E1E',
    padding: 14,
    gap: 12,
  },
  dangerCardLabel: {
    ...Typography.badge,
    fontSize: 10,
    color: '#F87171',
    letterSpacing: 0.8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricBig: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  metricSub: {
    ...Typography.caption,
    color: '#A1A1AA',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#381E1E',
  },
  nuclearBtn: {
    borderColor: '#EF4444',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authorBio: {
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 18,
  },
  linkRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  linkBtn: {
    flex: 1,
  },
});
