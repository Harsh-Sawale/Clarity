import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { PhotoItem } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
import { Header } from '../components/Header';
import { PhotoCard } from '../components/PhotoCard';
import {
  getPhotosByStatus,
  resurrectFromGrace,
  permanentlyDelete,
} from '../services/storage';
import { runLifecycleSweep } from '../services/expiration';

interface GraceScreenProps {
  onSelectPhoto: (item: PhotoItem) => void;
}

export const GraceScreen: React.FC<GraceScreenProps> = ({ onSelectPhoto }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadGrace = useCallback(async () => {
    await runLifecycleSweep();
    const items = await getPhotosByStatus('grace');
    setPhotos(items);
  }, []);

  useEffect(() => {
    loadGrace();
  }, [loadGrace]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadGrace();
    setIsRefreshing(false);
  };

  const handleResurrect = async (item: PhotoItem) => {
    await resurrectFromGrace(item.id, 2 * 60 * 60 * 1000); // 2h extension
    Alert.alert('Restored', 'Photo returned to Active notes with 2 hours left.');
    await loadGrace();
  };

  const handlePermanentDelete = async (item: PhotoItem) => {
    Alert.alert(
      'Erase Completely',
      'This photo will be erased from this phone forever. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Now',
          style: 'destructive',
          onPress: async () => {
            await permanentlyDelete(item.id);
            await loadGrace();
          },
        },
      ]
    );
  };

  const handlePurgeAll = async () => {
    if (photos.length === 0) return;
    Alert.alert(
      'Empty Grace Lounge',
      `Permanently erase all ${photos.length} photos right now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Lounge',
          style: 'destructive',
          onPress: async () => {
            for (const item of photos) {
              await permanentlyDelete(item.id);
            }
            await loadGrace();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Grace Lounge"
        subtitle="24-Hour Recovery Net"
        rightAction={
          photos.length > 0
            ? {
                label: 'Empty All',
                onPress: handlePurgeAll,
              }
            : undefined
        }
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>ACCIDENTAL LOSS PROTECTION</Text>
        <Text style={styles.bannerText}>
          Expired photos stay here for 24 hours before automatic permanent disk erasure. Tap
          'Restore' if you expired a photo by mistake.
        </Text>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textPrimary}
          />
        }
        renderItem={({ item }) => (
          <PhotoCard
            item={item}
            onPress={() => onSelectPhoto(item)}
            primaryActionLabel="Restore"
            onPrimaryAction={() => handleResurrect(item)}
            secondaryActionLabel="Erase"
            onSecondaryAction={() => handlePermanentDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={Typography.titleMedium}>Lounge is Empty</Text>
            <Text style={[Typography.bodyMedium, styles.emptySubtext]}>
              No photos currently in recovery. Everything is clean.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  banner: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  bannerTitle: {
    ...Typography.badge,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  bannerText: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 90,
    paddingHorizontal: Spacing.lg,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    color: Colors.textSecondary,
  },
});
