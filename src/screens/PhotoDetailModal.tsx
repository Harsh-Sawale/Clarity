import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { PhotoItem } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
import { formatRemainingTime } from '../services/expiration';
import { TagChip } from '../components/TagChip';

interface PhotoDetailModalProps {
  item: PhotoItem | null;
  onClose: () => void;
  onVault?: (item: PhotoItem) => void;
  onDelete?: (item: PhotoItem) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  item,
  onClose,
  onVault,
  onDelete,
}) => {
  if (!item) return null;

  return (
    <Modal visible={!!item} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.textButton} activeOpacity={0.7}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <Text style={Typography.caption}>INSPECTION</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Photo Display */}
        <View style={styles.imageBox}>
          <Image source={{ uri: item.uri }} style={styles.image} resizeMode="contain" />
        </View>

        {/* Metadata & Actions Drawer */}
        <View style={styles.detailsDrawer}>
          <View style={styles.badgeRow}>
            {item.groupName && <TagChip label={item.groupName.toUpperCase()} isSelected size="sm" />}
            <View style={styles.timerPill}>
              <Text style={styles.timerText}>
                {item.status === 'active' || item.status === 'limbo'
                  ? formatRemainingTime(item.expiresAt)
                  : item.status === 'grace' || item.status === 'crypt'
                  ? 'Grace Lounge (24h)'
                  : 'Permanent Keep'}
              </Text>
            </View>
          </View>

          {item.note && (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>MEMO</Text>
              <Text style={styles.noteValue}>{item.note}</Text>
            </View>
          )}

          <View style={styles.metaInfoRow}>
            <Text style={styles.metaLabel}>Captured:</Text>
            <Text style={styles.metaValue}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>

          {/* Action Row */}
          <View style={styles.actionsRow}>
            {(item.status === 'active' || item.status === 'limbo') && onVault && (
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => {
                  onVault(item);
                  onClose();
                }}
              >
                <Text style={styles.primaryActionText}>Save to Keepers</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.deleteActionButton}
                onPress={() => {
                  onDelete(item);
                  onClose();
                }}
              >
                <Text style={styles.deleteActionText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  textButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  closeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  imageBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsDrawer: {
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  noteBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  noteLabel: {
    ...Typography.badge,
    color: Colors.textMuted,
    fontSize: 10,
  },
  noteValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  metaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  primaryActionButton: {
    flex: 2,
    backgroundColor: Colors.textPrimary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteActionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteActionText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
