import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';
import { Header } from '../components/Header';
import { MAINTAINER_CONFIG } from '../config/maintainer';
import { getStorageMetrics } from '../services/storage';
import { formatBytes } from '../services/expiration';
import { StorageMetrics } from '../types';

export const InfoScreen: React.FC = () => {
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

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Header
        title="Info & Trust"
        subtitle="Open Source Transparency Hub"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          <Text style={styles.cardLabel}>MAINTAINER & REPOSITORY</Text>
          <Text style={styles.primaryTitle}>{MAINTAINER_CONFIG.appName}</Text>
          <Text style={styles.authorSubtitle}>By {MAINTAINER_CONFIG.authorName}</Text>
          <Text style={[Typography.bodyMedium, styles.bioText]}>
            {MAINTAINER_CONFIG.authorBio}
          </Text>

          <View style={styles.linkButtonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => openUrl(MAINTAINER_CONFIG.repositoryUrl)}
            >
              <Text style={styles.actionButtonText}>View on GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonSecondary}
              activeOpacity={0.7}
              onPress={() => openUrl(MAINTAINER_CONFIG.issuesUrl)}
            >
              <Text style={styles.actionButtonSecondaryText}>File an Issue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline & Zero-Telemetry Audit */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ZERO-TELEMETRY AUDIT</Text>
          <View style={styles.auditRow}>
            <Text style={styles.auditKey}>Network Permission:</Text>
            <Text style={styles.auditValue}>NOT REQUESTED</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditKey}>Storage Sandbox:</Text>
            <Text style={styles.auditValue}>ISOLATED SCOPE</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditKey}>Analytics Trackers:</Text>
            <Text style={styles.auditValue}>ZERO</Text>
          </View>
          <View style={styles.auditRow}>
            <Text style={styles.auditKey}>License:</Text>
            <Text style={styles.auditValue}>{MAINTAINER_CONFIG.license}</Text>
          </View>
          <Text style={[Typography.caption, styles.auditDescription]}>
            Clarity runs 100% on-device. It does not communicate with external servers, cloud
            providers, or analytics engines. All files remain in your phone's isolated sandbox.
          </Text>
        </View>

        {/* Architectural FAQ */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>FREQUENTLY ASKED QUESTIONS</Text>

          <Text style={styles.faqQuestion}>Can Google Photos or Apple Photos see these?</Text>
          <Text style={styles.faqAnswer}>
            No. Clarity saves files directly to the internal application sandbox. The Android
            system media scanner is blocked from indexing this folder, preventing automatic cloud
            syncing.
          </Text>

          <Text style={styles.faqQuestion}>How does automatic deletion work?</Text>
          <Text style={styles.faqAnswer}>
            When a photo exceeds its designated lifespan, it is immediately moved out of Limbo into
            The Crypt for a 24-hour grace window. Once that grace window expires, the physical file
            is purged from disk.
          </Text>
        </View>

        {/* Version Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {MAINTAINER_CONFIG.appName} v{MAINTAINER_CONFIG.version} (Build {MAINTAINER_CONFIG.buildNumber})
          </Text>
          <Text style={styles.footerText}>Released under the {MAINTAINER_CONFIG.license} License</Text>
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
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 8,
  },
  cardLabel: {
    ...Typography.badge,
    color: Colors.textMuted,
  },
  primaryTitle: {
    ...Typography.titleMedium,
  },
  authorSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bioText: {
    color: Colors.textSecondary,
  },
  linkButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  metricSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  auditKey: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  auditValue: {
    fontSize: 12,
    fontWeight: '600',
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
    paddingVertical: Spacing.md,
    gap: 4,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
