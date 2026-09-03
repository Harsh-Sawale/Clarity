import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PhotoItem } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
import { formatRemainingTime } from '../services/expiration';
import { TactileButton } from './TactileButton';

interface PhotoCardProps {
  item: PhotoItem;
  onPress: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  item,
  onPress,
  onPrimaryAction,
  primaryActionLabel,
  onSecondaryAction,
  secondaryActionLabel,
}) => {
  const isExpiring = item.status === 'active' || item.status === 'limbo';
  const isGrace = item.status === 'grace' || item.status === 'crypt';

  const statusLabel = isExpiring
    ? formatRemainingTime(item.expiresAt)
    : isGrace
    ? 'Grace Net (24h)'
    : 'Permanent';

  return (
    <View style={styles.card}>
      <TactileButton activeScale={0.98} onPress={onPress} style={styles.touchArea}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
          
          <View style={styles.topBadgeRow}>
            {item.groupName ? (
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{item.groupName.toUpperCase()}</Text>
              </View>
            ) : (
              <View />
            )}

            <View style={styles.timerPill}>
              <Text style={styles.timerText}>{statusLabel}</Text>
            </View>
          </View>
        </View>
      </TactileButton>

      <View style={styles.footer}>
        <View style={styles.infoCol}>
          {item.note ? (
            <Text style={styles.noteText} numberOfLines={1}>
              {item.note}
            </Text>
          ) : (
            <Text style={styles.dateText}>
              Snapped {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        <View style={styles.actionRow}>
          {onSecondaryAction && secondaryActionLabel && (
            <TactileButton
              onPress={onSecondaryAction}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>{secondaryActionLabel}</Text>
            </TactileButton>
          )}

          {onPrimaryAction && primaryActionLabel && (
            <TactileButton
              onPress={onPrimaryAction}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryText}>{primaryActionLabel}</Text>
            </TactileButton>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  touchArea: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.surfaceElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupBadge: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  groupBadgeText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  timerPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  infoCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  noteText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  primaryText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
