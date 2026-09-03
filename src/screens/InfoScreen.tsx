import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';
import { Header } from '../components/Header';
import { GlassButton } from '../components/GlassButton';
import { TactileButton } from '../components/TactileButton';
import { MAINTAINER_CONFIG } from '../config/maintainer';
import { getStorageMetrics } from '../services/storage';
import { formatBytes } from '../services/expiration';
import { StorageMetrics } from '../types';

interface InfoScreenProps {
  onBackToCamera?: () => void;
}

export const InfoScreen: React.FC<InfoScreenProps> = ({ onBackToCamera }) => {
  const [metrics, setMetrics] = useState<StorageMetrics>({
    activeCount: 0,
    cryptCount: 0,
    vaultCount: 0,
    reclaimedCount: 0,
    reclaimedBytes: 0,
  });

  useEffect(() => {
    getStorageMetrics().then(setMetrics);
  }, []);

  const openUrl = async (url: string, label: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert(label, `URL: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeaderBar}>
        {onBackToCamera && (
          <GlassButton
            title="< BACK"
            size="md"
            onPress={onBackToCamera}
            style={styles.backButton}
          />
        )}
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>INFO & TRUST</Text>
          <Text style={styles.headerSubtitle}>Open Source Transparency Hub</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Storage Impact Metrics */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>IMPACT METRICS</Text>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.reclaimedCount}</Text>
              <Text style={styles.metricSubtitle}>Photos Cleansed</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatBytes(metrics.reclaimedBytes)}</Text>
              <Text style={styles.metricSubtitle}>Storage Reclaimed</Text>
            </View>
          </View>
        </View>

        {/* Maintainer & Open Source Attribution */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CREATOR & SOURCE CODE</Text>
          <Text style={styles.primaryTitle}>{MAINTAINER_CONFIG.appName}</Text>
          <Text style={styles.authorSubtitle}>Engineered by {MAINTAINER_CONFIG.authorName}</Text>
          <Text style={[Typography.bodyMedium, styles.bioText]}>
            {MAINTAINER_CONFIG.authorBio}
          </Text>

          <View style={styles.linkButtonsCol}>
            <TactileButton
              style={styles.actionButton}
              textStyle={styles.actionButtonText}
              title="Open Harsh's GitHub Profile"
              onPress={() => openUrl(`https://github.com/${MAINTAINER_CONFIG.githubUsername}`, 'GitHub Profile')}
            />

            <TactileButton
              style={styles.actionButtonSecondary}
              textStyle={styles.actionButtonSecondaryText}
              title="View Clarity Source Repository"
              onPress={() => openUrl(MAINTAINER_CONFIG.repositoryUrl, 'Source Repository')}
            />
          </View>
        </View>

        {/* Offline & Zero-Telemetry Audit */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ZERO-NETWORK AUDIT</Text>
          <View style={styles.auditRow}>
            <Text style={styles.auditKey}>Network Permission:</Text>
            <Text style={styles.auditValue}>NOT REQUESTED</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditKey}>Storage Sandbox:</Text>
            <Text style={styles.auditValue}>ISOLATED SCOPE</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditKey}>Analytics / Trackers:</Text>
            <Text style={styles.auditValue}>ZERO</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditKey}>License:</Text>
            <Text style={styles.auditValue}>{MAINTAINER_CONFIG.license}</Text>
          </View>
          <Text style={[Typography.caption, styles.auditDescription]}>
            Clarity runs 100% on-device. It does not communicate with external servers, cloud
            providers, or analytics engines. All files remain strictly in your phone's isolated sandbox.
          </Text>
        </View>

        {/* FAQ */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>FREQUENTLY ASKED QUESTIONS</Text>

          <Text style={styles.faqQuestion}>Can Google Photos see these photos?</Text>
          <Text style={styles.faqAnswer}>
            No. Clarity saves files directly to an internal application sandbox. The Android
            system media scanner is blocked from indexing this folder, preventing automatic cloud
            syncing.
          </Text>

          <Text style={styles.faqQuestion}>How does automatic deletion work?</Text>
          <Text style={styles.faqAnswer}>
            When a photo exceeds its designated lifespan, it is immediately moved to the Grace
            Lounge for a 24-hour recovery period. Once that grace period expires, the physical file
            is permanently erased from disk.
          </Text>
        </View>

        {/* Footer Signature */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerAuthorSignature}>Made by Harsh</Text>
          <Text style={styles.footerVersionText}>
            {MAINTAINER_CONFIG.appName} Version {MAINTAINER_CONFIG.version} (Build {MAINTAINER_CONFIG.buildNumber})
          </Text>
          <Text style={styles.footerLicenseText}>Open Source • Released under the {MAINTAINER_CONFIG.license} License</Text>
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
  topHeaderBar: {
    paddingTop: 45,
    paddingBottom: 14,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#0C0C0E',
    borderBottomWidth: 1,
    borderBottomColor: '#202024',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    minWidth: 80,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 10,
  },
  cardLabel: {
    ...Typography.badge,
    color: Colors.textMuted,
    fontSize: 10,
  },
  primaryTitle: {
    ...Typography.titleMedium,
  },
  authorSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bioText: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  linkButtonsCol: {
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionButtonText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionButtonSecondaryText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  metricSubtitle: {
    ...Typography.caption,
    marginTop: 2,
    color: Colors.textSecondary,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  auditKey: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  auditValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
  auditDescription: {
    marginTop: 6,
    lineHeight: 18,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  faqAnswer: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 4,
  },
  footerAuthorSignature: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  footerVersionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  footerLicenseText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
});
