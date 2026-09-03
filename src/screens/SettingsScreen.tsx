import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';
import { Header } from '../components/Header';
import { wipeAllData } from '../services/storage';

export const SettingsScreen: React.FC = () => {
  const [haptics, setHaptics] = useState<boolean>(true);
  const [autoCompress, setAutoCompress] = useState<boolean>(true);
  const [gracePeriodHours, setGracePeriodHours] = useState<number>(24);

  const handleNuclearWipe = () => {
    Alert.alert(
      'Nuclear Wipe',
      'This will permanently delete all temporary photos, vault items, and statistics. Are you completely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Everything',
          style: 'destructive',
          onPress: async () => {
            await wipeAllData();
            Alert.alert('Clean Slate', 'All local storage has been wiped clean.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Settings"
        subtitle="System Preferences & Storage"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hardware & Feedback */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>HARDWARE & FEEDBACK</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Haptic Feedback</Text>
              <Text style={styles.toggleSubtitle}>Vibration on shutter and lifespan selection</Text>
            </View>
            <Switch
              value={haptics}
              onValueChange={setHaptics}
              trackColor={{ false: Colors.surfaceElevated, true: Colors.textPrimary }}
              thumbColor={haptics ? Colors.background : Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Auto-Compression</Text>
              <Text style={styles.toggleSubtitle}>
                Compress scratches to 70% quality to save space
              </Text>
            </View>
            <Switch
              value={autoCompress}
              onValueChange={setAutoCompress}
              trackColor={{ false: Colors.surfaceElevated, true: Colors.textPrimary }}
              thumbColor={autoCompress ? Colors.background : Colors.textMuted}
            />
          </View>
        </View>

        {/* Lifecycle Settings */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>LIFECYCLE RULES</Text>

          <View style={styles.optionRow}>
            <Text style={styles.optionTitle}>Safety Lounge Grace Period</Text>
            <Text style={styles.optionValue}>{gracePeriodHours} Hours</Text>
          </View>
          <Text style={[Typography.caption, styles.settingDescription]}>
            Photos moved from Limbo will reside in The Crypt for {gracePeriodHours} hours before
            permanent erasure.
          </Text>
        </View>

        {/* Data Management */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DATA MANAGEMENT</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            activeOpacity={0.7}
            onPress={handleNuclearWipe}
          >
            <Text style={styles.dangerButtonText}>Nuclear Clean (Wipe All Data)</Text>
          </TouchableOpacity>
          <Text style={[Typography.caption, styles.settingDescription]}>
            Immediately erases all active, crypt, and vault photos from disk and resets all storage
            counters.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 12,
  },
  cardLabel: {
    ...Typography.badge,
    color: Colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  toggleSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  optionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingDescription: {
    lineHeight: 18,
  },
  dangerButton: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
