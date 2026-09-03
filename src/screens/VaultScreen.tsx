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

interface VaultScreenProps {
  onSelectPhoto: (item: PhotoItem) => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({ onSelectPhoto }) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadVault = useCallback(async () => {
    const items = await getPhotosByStatus('vault');
    setPhotos(items);
  }, []);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadVault();
    setIsRefreshing(false);
  };

  const handleDelete = async (item: PhotoItem) => {
    Alert.alert('Delete Vault Item', 'Remove this permanently saved item from the Vault?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await permanentlyDelete(item.id);
          await loadVault();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="The Vault"
        subtitle={`${photos.length} permanent sandboxed items`}
      />

      <View style={styles.infoBanner}>
        <Text style={styles.infoTitle}>LOCAL ARCHIVE</Text>
        <Text style={styles.infoBody}>
          Items stored here do not expire and will not be automatically deleted. They remain
          isolated in Clarity's private sandbox without cluttering your system gallery.
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
            primaryActionLabel="Inspect"
            onPrimaryAction={() => onSelectPhoto(item)}
            secondaryActionLabel="Delete"
            onSecondaryAction={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={Typography.titleMedium}>Vault is Empty</Text>
            <Text style={[Typography.bodyMedium, styles.emptySubtext]}>
              No photos stored in your permanent archive. Tap 'Vault' on any Limbo photo to keep it
              indefinitely.
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
