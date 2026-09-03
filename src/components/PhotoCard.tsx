import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { PhotoItem } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
import { formatRemainingTime } from '../services/expiration';
import { TagChip } from './TagChip';

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
  const remainingText =
    item.status === 'limbo'
      ? formatRemainingTime(item.expiresAt)
      : item.status === 'crypt'
      ? 'Grace Period'
      : 'Permanent';

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
        <View style={styles.topBadgeRow}>
          {item.tag && <TagChip label={item.tag.toUpperCase()} size="sm" isSelected />}
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>{remainingText}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {item.note ? (
          <Text style={[Typography.caption, styles.noteText]} numberOfLines={1}>
            {item.note}
          </Text>
        ) : (
          <Text style={[Typography.caption, styles.dateText]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}

        <View style={styles.actionRow}>
          {onSecondaryAction && secondaryActionLabel && (
            <TouchableOpacity
              onPress={onSecondaryAction}
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryText}>{secondaryActionLabel}</Text>
            </TouchableOpacity>
          )}

          {onPrimaryAction && primaryActionLabel && (
            <TouchableOpacity
              onPress={onPrimaryAction}
              style={styles.primaryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryText}>{primaryActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 190,
    backgroundColor: Colors.surfaceElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgeRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerPill: {
    backgroundColor: Colors.overlay,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  footer: {
    padding: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteText: {
    flex: 1,
    marginRight: Spacing.sm,
    color: Colors.textSecondary,
  },
  dateText: {
    flex: 1,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryButton: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  primaryText: {
    color: Colors.background,
    fontSize: 11,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});
