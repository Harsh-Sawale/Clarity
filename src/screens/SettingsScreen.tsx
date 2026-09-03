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
          <Text style={styles.title}>CUSTOMIZATION & SETTINGS</Text>
          <Text style={styles.subtitle}>Precision control over your camera and storage</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Default Lifespan Duration */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DEFAULT LIFESPAN FOR NEW PHOTOS</Text>
          <Text style={styles.cardHelp}>The timer preset automatically selected after taking a photo.</Text>
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

        {/* Section 2: Safety Net Duration */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>GRACE LOUNGE SAFETY NET</Text>
          <Text style={styles.cardHelp}>
            How long expired photos wait in the safety lounge before unrecoverable physical disk erasure.
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

        {/* Section 3: Camera Optics & Aspect Ratio */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CAMERA HARDWARE SENSOR RATIO</Text>
          <Text style={styles.cardHelp}>
            4:3 uses the pure optical sensor with zero wide-angle distortion. 16:9 fills wider screens.
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

        {/* Section 4: Compression Quality */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SCRATCHPAD COMPRESSION</Text>
          <Text style={styles.cardHelp}>
            Compressing photos saves local space while preserving crisp readability for text and barcodes.
          </Text>
          <View style={styles.pillsRow}>
            {[
              { label: 'ULTRA (65%)', val: 0.65 },
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

        {/* Section 5: Haptic Feedback */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TACTILE HAPTIC VIBRATION</Text>
          <Text style={styles.cardHelp}>Mechanical vibration response when tapping buttons and shutter.</Text>
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

        {/* Section 6: Reclaimed Storage & Nuclear Clean */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerCardLabel}>STORAGE RECLAIMED & DANGER ZONE</Text>
          <View style={styles.metricRow}>
            <View>
              <Text style={styles.metricBig}>{metrics.reclaimedCount}</Text>
              <Text style={styles.metricSub}>Photos Cleansed</Text>
            </View>
            <View style={styles.metricDivider} />
            <View>
              <Text style={styles.metricBig}>{formatBytes(metrics.reclaimedBytes)}</Text>
              <Text style={styles.metricSub}>Space Saved</Text>
            </View>
          </View>
          <GlassButton
            title="NUCLEAR CLEAN (WIPE ALL DATA)"
            size="md"
            onPress={handleNuclearWipe}
            style={styles.nuclearBtn}
          />
        </View>

        {/* Section 7: Open Source Attribution & GitHub Links */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>OPEN SOURCE REPOSITORY & AUTHOR</Text>
          <Text style={styles.authorName}>{MAINTAINER_CONFIG.authorName}</Text>
          <Text style={styles.authorBio}>{MAINTAINER_CONFIG.authorBio}</Text>
          <View style={styles.linkRow}>
            <GlassButton
              title="VIEW SOURCE ON GITHUB"
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
