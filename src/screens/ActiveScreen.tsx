import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { PhotoItem } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
import { Header } from '../components/Header';
import { PhotoCard } from '../components/PhotoCard';
import { TactileButton } from '../components/TactileButton';
import {
  getPhotosByStatus,
  moveToKeepers,
  moveToGraceLounge,
  getUserGroups,
} from '../services/storage';
import { runLifecycleSweep } from '../services/expiration';

interface ActiveScreenProps {
  onNavigateToCamera: () => void;
  onSelectPhoto: (item: PhotoItem) => void;
}

export const ActiveScreen: React.FC<ActiveScreenProps> = ({
  onNavigateToCamera,
  onSelectPhoto,
}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    await runLifecycleSweep();
    const items = await getPhotosByStatus('active');
    setPhotos(items);

    const groups = await getUserGroups();
    setUserGroups(groups);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleKeepPermanent = async (item: PhotoItem) => {
    await moveToKeepers(item.id);
    await loadData();
  };

  const handlePurgeEarly = async (item: PhotoItem) => {
    Alert.alert(
      'Move to Grace Lounge',
      'This photo will be moved to the 24-hour safety recovery lounge before final cleanup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move Now',
          style: 'destructive',
          onPress: async () => {
            await moveToGraceLounge(item.id);
            await loadData();
          },
        },
      ]
    );
  };

  const filteredPhotos =
    selectedGroup === 'all'
      ? photos
      : photos.filter((p) => p.groupName?.toLowerCase() === selectedGroup.toLowerCase());

  return (
    <View style={styles.container}>
      <Header
        title="Expiring Notes"
        subtitle={`${photos.length} active temporary photos`}
        rightAction={{
          label: 'Snap +',
          onPress: onNavigateToCamera,
        }}
      />

      {/* User-Defined Groups Horizontal Filter Bar */}
      {userGroups.length > 0 && (
        <View style={styles.groupsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupsScroll}>
            <TactileButton
              onPress={() => setSelectedGroup('all')}
              style={[
                styles.groupChip,
                selectedGroup === 'all' && styles.groupChipActive,
              ]}
            >
              <Text style={[styles.groupChipText, selectedGroup === 'all' && styles.groupChipTextActive]}>
                ALL ({photos.length})
              </Text>
            </TactileButton>

            {userGroups.map((grp) => {
              const count = photos.filter((p) => p.groupName?.toLowerCase() === grp.toLowerCase()).length;
              return (
                <TactileButton
                  key={grp}
                  onPress={() => setSelectedGroup(grp)}
                  style={[
                    styles.groupChip,
                    selectedGroup === grp && styles.groupChipActive,
                  ]}
                >
                  <Text style={[styles.groupChipText, selectedGroup === grp && styles.groupChipTextActive]}>
                    {grp.toUpperCase()} ({count})
                  </Text>
                </TactileButton>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Photo Stream */}
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
            primaryActionLabel="Keep"
            onPrimaryAction={() => handleKeepPermanent(item)}
            secondaryActionLabel="Purge"
            onSecondaryAction={() => handlePurgeEarly(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={Typography.titleMedium}>Your Slate is Clean</Text>
            <Text style={[Typography.bodyMedium, styles.emptySubtext]}>
              No photos currently expiring. Your phone gallery is clutter-free.
            </Text>
            <TactileButton
              onPress={onNavigateToCamera}
              style={styles.emptyButton}
              textStyle={styles.emptyButtonText}
              title="Capture Scratch Photo"
            />
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
  groupsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  groupsScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groupChipActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  groupChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  groupChipTextActive: {
    color: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 90,
    paddingHorizontal: Spacing.xl,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: Spacing.lg,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
