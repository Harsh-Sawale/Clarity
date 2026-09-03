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
import { getPhotosByStatus, permanentlyDelete } from '../services/storage';

interface KeepersScreenProps {
  onSelectPhoto: (item: PhotoItem) => void;
}

export const KeepersScreen: React.FC<KeepersScreenProps> = ({ onSelectPhoto }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadKeepers = useCallback(async () => {
    const items = await getPhotosByStatus('keeper');
    setPhotos(items);
  }, []);

  useEffect(() => {
    loadKeepers();
  }, [loadKeepers]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadKeepers();
    setIsRefreshing(false);
  };

  const handleDelete = async (item: PhotoItem) => {
    Alert.alert('Remove Keeper', 'Permanently remove this photo from your keepers?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await permanentlyDelete(item.id);
          await loadKeepers();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Keepers"
        subtitle={`${photos.length} permanently saved photos`}
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>SANDBOXED PERMANENT ARCHIVE</Text>
        <Text style={styles.bannerText}>
          Photos stored here never expire. They remain private inside Clarity without mixing into
          your main camera roll or cluttering Google Photos.
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
            primaryActionLabel="View"
            onPrimaryAction={() => onSelectPhoto(item)}
            secondaryActionLabel="Remove"
            onSecondaryAction={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={Typography.titleMedium}>No Keepers Stored</Text>
            <Text style={[Typography.bodyMedium, styles.emptySubtext]}>
              When you decide a temporary photo is worth keeping indefinitely, tap 'Keep' to save
              it here.
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
