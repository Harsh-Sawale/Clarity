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
import { PhotoItem, CategoryTag } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
import { Header } from '../components/Header';
import { PhotoCard } from '../components/PhotoCard';
import { TagChip } from '../components/TagChip';
import { getPhotosByStatus, moveToVault, moveToCrypt } from '../services/storage';
import { runLifecycleSweep } from '../services/expiration';

interface LimboScreenProps {
  onNavigateToCamera: () => void;
  onSelectPhoto: (item: PhotoItem) => void;
}

export const LimboScreen: React.FC<LimboScreenProps> = ({
  onNavigateToCamera,
  onSelectPhoto,
}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<CategoryTag | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadPhotos = useCallback(async () => {
    await runLifecycleSweep();
    const items = await getPhotosByStatus('limbo');
    setPhotos(items);
  }, []);

  useEffect(() => {
    loadPhotos();
    // Heartbeat ticker to refresh expiration badges every 15 seconds
    const interval = setInterval(loadPhotos, 15000);
    return () => clearInterval(interval);
  }, [loadPhotos]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadPhotos();
    setIsRefreshing(false);
  };

  const handleKeepPermanent = async (item: PhotoItem) => {
    await moveToVault(item.id);
    await loadPhotos();
  };

  const handlePurgeEarly = async (item: PhotoItem) => {
    Alert.alert(
      'Move to Crypt',
      'This item will enter the 24-hour safety grace period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          style: 'destructive',
          onPress: async () => {
            await moveToCrypt(item.id);
            await loadPhotos();
          },
        },
      ]
    );
  };

  const filteredPhotos =
    selectedTag === 'all'
      ? photos
      : photos.filter((p) => p.tag === selectedTag);

  return (
    <View style={styles.container}>
      <Header
        title="The Limbo"
        subtitle={`${photos.length} active ephemeral items`}
        rightAction={{
          label: 'New Snap',
          onPress: onNavigateToCamera,
        }}
      />

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TagChip
          label="ALL"
          isSelected={selectedTag === 'all'}
          onPress={() => setSelectedTag('all')}
          size="sm"
        />
        {(['parking', 'receipt', 'pass', 'note'] as CategoryTag[]).map((tag) => (
          <TagChip
            key={tag}
            label={tag.toUpperCase()}
            isSelected={selectedTag === tag}
            onPress={() => setSelectedTag(tag)}
            size="sm"
          />
        ))}
      </View>

      {/* Photo List */}
      <FlatList
        data={filteredPhotos}
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
            primaryActionLabel="Vault"
            onPrimaryAction={() => handleKeepPermanent(item)}
            secondaryActionLabel="Purge"
            onSecondaryAction={() => handlePurgeEarly(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={Typography.titleMedium}>All Clear</Text>
            <Text style={[Typography.bodyMedium, styles.emptySubtext]}>
              No temporary photos in Limbo. Your phone is completely decluttered.
            </Text>
            <TouchableOpacity
              onPress={onNavigateToCamera}
              style={styles.emptyButton}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Capture Scratch Photo</Text>
            </TouchableOpacity>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
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
    marginBottom: Spacing.lg,
    color: Colors.textSecondary,
  },
  emptyButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
