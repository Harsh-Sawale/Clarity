import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { PhotoItem, PhotoStatus } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
import { PhotoCard } from '../components/PhotoCard';
import { GlassButton } from '../components/GlassButton';
import {
  getPhotosByStatus,
  moveToKeepers,
  moveToGraceLounge,
  resurrectFromGrace,
  permanentlyDelete,
  getUserGroups,
} from '../services/storage';
import { runLifecycleSweep } from '../services/expiration';

type SubTab = 'active' | 'grace' | 'keeper';

interface GalleryHubProps {
  onBackToCamera: () => void;
  onSelectPhoto: (item: PhotoItem) => void;
}

export const GalleryHub: React.FC<GalleryHubProps> = ({
  onBackToCamera,
  onSelectPhoto,
}) => {
  const [currentTab, setCurrentTab] = useState<SubTab>('active');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    await runLifecycleSweep();
    const items = await getPhotosByStatus(currentTab as PhotoStatus);
    setPhotos(items);

    const groups = await getUserGroups();
    setUserGroups(groups);
  }, [currentTab]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
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
      'This photo will be held in the 24-hour safety lounge before final deletion.',
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

  const handleResurrect = async (item: PhotoItem) => {
    await resurrectFromGrace(item.id, 2 * 60 * 60 * 1000);
    Alert.alert('Restored', 'Photo returned to Expiring notes with 2 hours remaining.');
    await loadData();
  };

  const handlePermanentDelete = async (item: PhotoItem) => {
    Alert.alert(
      'Erase Permanently',
      'This photo will be permanently wiped from this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase',
          style: 'destructive',
          onPress: async () => {
            await permanentlyDelete(item.id);
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
      {/* Top Header with Back to Camera and Tab Segment */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <GlassButton
            title="< CAMERA"
            size="sm"
            onPress={onBackToCamera}
            style={styles.backBtn}
          />
          <Text style={styles.hubTitle}>VAULT & ALBUMS</Text>
          <View style={{ width: 85 }} />
        </View>

        {/* Liquid Glass Segment Slider */}
        <View style={styles.tabBar}>
          <GlassButton
            title="EXPIRING"
            size="sm"
            isActive={currentTab === 'active'}
            onPress={() => setCurrentTab('active')}
            style={styles.tabItem}
          />
          <GlassButton
            title="24H GRACE"
            size="sm"
            isActive={currentTab === 'grace'}
            onPress={() => setCurrentTab('grace')}
            style={styles.tabItem}
          />
          <GlassButton
            title="KEEPERS"
            size="sm"
            isActive={currentTab === 'keeper'}
            onPress={() => setCurrentTab('keeper')}
            style={styles.tabItem}
          />
        </View>
      </View>

      {/* User Groups Filter Bar (when on Expiring tab) */}
      {currentTab === 'active' && userGroups.length > 0 && (
        <View style={styles.groupsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupsScroll}>
            <GlassButton
              title={`ALL (${photos.length})`}
              size="sm"
              isActive={selectedGroup === 'all'}
              onPress={() => setSelectedGroup('all')}
              style={styles.groupChip}
            />
            {userGroups.map((grp) => {
              const count = photos.filter((p) => p.groupName?.toLowerCase() === grp.toLowerCase()).length;
              return (
                <GlassButton
                  key={grp}
                  title={`${grp.toUpperCase()} (${count})`}
                  size="sm"
                  isActive={selectedGroup === grp}
                  onPress={() => setSelectedGroup(grp)}
                  style={styles.groupChip}
                />
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
            primaryActionLabel={
              currentTab === 'active'
                ? 'Keep'
                : currentTab === 'grace'
                ? 'Restore'
                : 'Inspect'
            }
            onPrimaryAction={() => {
              if (currentTab === 'active') handleKeepPermanent(item);
              else if (currentTab === 'grace') handleResurrect(item);
              else onSelectPhoto(item);
            }}
            secondaryActionLabel={
              currentTab === 'active'
                ? 'Purge'
                : currentTab === 'grace'
                ? 'Erase'
                : 'Delete'
            }
            onSecondaryAction={() => {
              if (currentTab === 'active') handlePurgeEarly(item);
              else handlePermanentDelete(item);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={Typography.titleMedium}>
              {currentTab === 'active'
                ? 'No Expiring Notes'
                : currentTab === 'grace'
                ? 'Grace Lounge is Empty'
                : 'No Keepers Stored'}
            </Text>
            <Text style={[Typography.bodyMedium, styles.emptySubtext]}>
              {currentTab === 'active'
                ? 'Your phone is completely decluttered. Return to the camera to snap a temporary scratch photo.'
                : currentTab === 'grace'
                ? 'Photos that expire will wait here for 24 hours before unrecoverable erasure.'
                : 'When you want to keep a scratch photo permanently without saving it to your system camera roll, tap Keep.'}
            </Text>
            {currentTab === 'active' && (
              <GlassButton
                title="SNAP A SCRATCH PHOTO"
                size="md"
                isActive
                onPress={onBackToCamera}
                style={styles.snapBtn}
              />
            )}
          </View>
        }
      />
    </View>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: statusBarHeight + 10,
    paddingBottom: 14,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#0C0C0E',
    borderBottomWidth: 1,
    borderBottomColor: '#202024',
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    minWidth: 85,
  },
  hubTitle: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16161A',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#26262C',
    gap: 4,
  },
  tabItem: {
    flex: 1,
  },
  groupsBar: {
    backgroundColor: '#0A0A0C',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E1E22',
  },
  groupsScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  groupChip: {
    paddingHorizontal: 12,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40,
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
  snapBtn: {
    marginTop: 4,
  },
});
