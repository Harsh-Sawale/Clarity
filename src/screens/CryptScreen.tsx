import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { PhotoItem } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
import { Header } from '../components/Header';
import { PhotoCard } from '../components/PhotoCard';
import {
  getPhotosByStatus,
  resurrectFromCrypt,
  permanentlyDelete,
} from '../services/storage';
import { runLifecycleSweep } from '../services/expiration';

interface CryptScreenProps {
  onSelectPhoto: (item: PhotoItem) => void;
}

export const CryptScreen: React.FC<CryptScreenProps> = ({ onSelectPhoto }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadCrypt = useCallback(async () => {
    await runLifecycleSweep();
    const items = await getPhotosByStatus('crypt');
    setPhotos(items);
  }, []);

  useEffect(() => {
    loadCrypt();
  }, [loadCrypt]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadCrypt();
    setIsRefreshing(false);
  };

  const handleResurrect = async (item: PhotoItem) => {
    await resurrectFromCrypt(item.id, 2 * 60 * 60 * 1000); // 2h extension
    Alert.alert('Resurrected', 'Item returned to Limbo with a 2-hour lifespan.');
    await loadCrypt();
  };

  const handlePermanentDelete = async (item: PhotoItem) => {
    Alert.alert(
      'Permanent Erasure',
      'This photo will be completely wiped from disk. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe',
          style: 'destructive',
          onPress: async () => {
            await permanentlyDelete(item.id);
            await loadCrypt();
          },
        },
      ]
    );
  };

  const handlePurgeAll = async () => {
    if (photos.length === 0) return;
    Alert.alert(
      'Empty the Crypt',
      `Permanently delete all ${photos.length} grace period photos immediately?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Now',
          style: 'destructive',
          onPress: async () => {
            for (const item of photos) {
              await permanentlyDelete(item.id);
            }
            await loadCrypt();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="The Crypt"
        subtitle="24-Hour Safety Grace Lounge"
        rightAction={
          photos.length > 0
            ? {
                label: 'Empty All',
                onPress: handlePurgeAll,
              }
            : undefined
        }
      />

      {/* Explainer Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoTitle}>SAFETY NET ACTIVE</Text>
        <Text style={styles.infoBody}>
          Items moved here remain for 24 hours before unrecoverable physical disk erasure. You can
          resurrect them anytime before expiration.
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
            primaryActionLabel="Resurrect"
            onPrimaryAction={() => handleResurrect(item)}
            secondaryActionLabel="Wipe"
            onSecondaryAction={() => handlePermanentDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={Typography.titleMedium}>Crypt is Empty</Text>
            <Text style={[Typography.bodyMedium, styles.emptySubtext]}>
              No photos currently in grace period.
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
  infoBanner: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  infoTitle: {
    ...Typography.badge,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoBody: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: Spacing.lg,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    color: Colors.textSecondary,
  },
});
