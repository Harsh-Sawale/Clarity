import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
  Image,
  Pressable,
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
  batchMoveToKeepers,
  batchMoveToGrace,
  batchPermanentlyDelete,
  batchExtendLifespan,
} from '../services/storage';
import { runLifecycleSweep, formatRemainingTime } from '../services/expiration';

type SubTab = 'active' | 'grace' | 'keeper';
type ViewMode = 'grid' | 'list';

interface GalleryHubProps {
  onBackToCamera: () => void;
  onSelectPhoto: (item: PhotoItem) => void;
  onNavigateToSettings: () => void;
}

export const GalleryHub: React.FC<GalleryHubProps> = ({
  onBackToCamera,
  onSelectPhoto,
  onNavigateToSettings,
}) => {
  const [currentTab, setCurrentTab] = useState<SubTab>('active');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default to list format as requested!
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    await runLifecycleSweep();
    const items = await getPhotosByStatus(currentTab as PhotoStatus);
    setPhotos(items);
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

  const toggleSelectPhoto = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map((p) => p.id)));
    }
  };

  // Batch Handlers
  const handleBatchKeep = async () => {
    const ids = Array.from(selectedIds);
    await batchMoveToKeepers(ids);
    setSelectedIds(new Set());
    setIsSelectMode(false);
    await loadData();
  };

  const handleBatchPurge = async () => {
    const ids = Array.from(selectedIds);
    Alert.alert(
      'Batch Action',
      `Move ${ids.length} photos to the 24-hour Grace Lounge?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Grace',
          style: 'destructive',
          onPress: async () => {
            if (currentTab === 'grace' || currentTab === 'keeper') {
              await batchPermanentlyDelete(ids);
            } else {
              await batchMoveToGrace(ids);
            }
            setSelectedIds(new Set());
            setIsSelectMode(false);
            await loadData();
          },
        },
      ]
    );
  };

  const handleBatchExtend = async () => {
    const ids = Array.from(selectedIds);
    await batchExtendLifespan(ids, 2 * 60 * 60 * 1000); // +2 hours
    Alert.alert('Extended', `Added 2 hours of lifespan to ${ids.length} photos.`);
    setSelectedIds(new Set());
    setIsSelectMode(false);
    await loadData();
  };

  // Single Item Handlers
  const handleKeepPermanent = async (item: PhotoItem) => {
    await moveToKeepers(item.id);
    await loadData();
  };

  const handlePurgeEarly = async (item: PhotoItem) => {
    await moveToGraceLounge(item.id);
    await loadData();
  };

  const handleResurrect = async (item: PhotoItem) => {
    await resurrectFromGrace(item.id, 2 * 60 * 60 * 1000);
    await loadData();
  };

  const handlePermanentDelete = async (item: PhotoItem) => {
    Alert.alert('Erase Permanently', 'Wipe this photo permanently from this phone?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Erase',
        style: 'destructive',
        onPress: async () => {
          await permanentlyDelete(item.id);
          await loadData();
        },
      },
    ]);
  };

  // Render High-Density List Item
  const renderListItem = (item: PhotoItem) => {
    const isSelected = selectedIds.has(item.id);
    const dateFormatted = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Pressable
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => {
          if (isSelectMode) toggleSelectPhoto(item.id);
          else onSelectPhoto(item);
        }}
        onLongPress={() => {
          setIsSelectMode(true);
          toggleSelectPhoto(item.id);
        }}
      >
        {isSelectMode && (
          <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
            {isSelected && <View style={styles.checkDot} />}
          </View>
        )}

        <Image source={{ uri: item.uri }} style={styles.listThumb} />

        <View style={styles.listContent}>
          <Text style={styles.listNote} numberOfLines={1}>
            {item.note || 'Scratch Photo'}
          </Text>
          <Text style={styles.listMeta}>Snapped at {dateFormatted}</Text>
        </View>

        <View style={styles.listRight}>
          {currentTab === 'active' && (
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{formatRemainingTime(item.expiresAt)}</Text>
            </View>
          )}
          {currentTab === 'grace' && (
            <View style={[styles.badgePill, styles.graceBadge]}>
              <Text style={styles.badgeText}>IN GRACE</Text>
            </View>
          )}
          {currentTab === 'keeper' && (
            <View style={[styles.badgePill, styles.keeperBadge]}>
              <Text style={styles.badgeText}>KEEPER</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <GlassButton
            title="< CAMERA"
            size="sm"
            onPress={onBackToCamera}
            style={styles.navBtn}
          />
          <Text style={styles.hubTitle}>VAULT & ALBUMS</Text>
          <GlassButton
            title="SETTINGS"
            size="sm"
            onPress={onNavigateToSettings}
            style={styles.navBtn}
          />
        </View>

        {/* Liquid Glass Segment Slider */}
        <View style={styles.tabBar}>
          <GlassButton
            title={`EXPIRING (${currentTab === 'active' ? photos.length : ''})`}
            size="sm"
            isActive={currentTab === 'active'}
            onPress={() => {
              setCurrentTab('active');
              setSelectedIds(new Set());
              setIsSelectMode(false);
            }}
            style={styles.tabItem}
          />
          <GlassButton
            title="24H GRACE"
            size="sm"
            isActive={currentTab === 'grace'}
            onPress={() => {
              setCurrentTab('grace');
              setSelectedIds(new Set());
              setIsSelectMode(false);
            }}
            style={styles.tabItem}
          />
          <GlassButton
            title="KEEPERS"
            size="sm"
            isActive={currentTab === 'keeper'}
            onPress={() => {
              setCurrentTab('keeper');
              setSelectedIds(new Set());
              setIsSelectMode(false);
            }}
            style={styles.tabItem}
          />
        </View>

        {/* View Mode & Multi-Select Bar */}
        <View style={styles.actionBar}>
          <View style={styles.modeToggleGroup}>
            <GlassButton
              title="LIST"
              size="sm"
              isActive={viewMode === 'list'}
              onPress={() => setViewMode('list')}
              style={styles.toggleBtn}
            />
            <GlassButton
              title="GRID"
              size="sm"
              isActive={viewMode === 'grid'}
              onPress={() => setViewMode('grid')}
              style={styles.toggleBtn}
            />
          </View>

          {photos.length > 0 && (
            <GlassButton
              title={isSelectMode ? `CANCEL (${selectedIds.size})` : 'SELECT MULTIPLE'}
              size="sm"
              isActive={isSelectMode}
              onPress={() => {
                if (isSelectMode) setSelectedIds(new Set());
                setIsSelectMode(!isSelectMode);
              }}
              style={styles.selectBtn}
            />
          )}
        </View>
      </View>

      {/* Select All Row when in Select Mode */}
      {isSelectMode && photos.length > 0 && (
        <View style={styles.selectBar}>
          <Text style={styles.selectStatus}>
            {selectedIds.size} of {photos.length} selected
          </Text>
          <GlassButton
            title={selectedIds.size === photos.length ? 'DESELECT ALL' : 'SELECT ALL'}
            size="sm"
            onPress={selectAll}
            style={styles.selectAllBtn}
          />
        </View>
      )}

      {/* Main Photo FlatList */}
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContentContainer,
          isSelectMode && selectedIds.size > 0 && { paddingBottom: 110 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textPrimary}
          />
        }
        renderItem={({ item }) =>
          viewMode === 'list' ? (
            renderListItem(item)
          ) : (
            <PhotoCard
              item={item}
              onPress={() => {
                if (isSelectMode) toggleSelectPhoto(item.id);
                else onSelectPhoto(item);
              }}
              primaryActionLabel={
                currentTab === 'active' ? 'Keep' : currentTab === 'grace' ? 'Restore' : 'Inspect'
              }
              onPrimaryAction={() => {
                if (currentTab === 'active') handleKeepPermanent(item);
                else if (currentTab === 'grace') handleResurrect(item);
                else onSelectPhoto(item);
              }}
              secondaryActionLabel={
                currentTab === 'active' ? 'Purge' : currentTab === 'grace' ? 'Erase' : 'Delete'
              }
              onSecondaryAction={() => {
                if (currentTab === 'active') handlePurgeEarly(item);
                else handlePermanentDelete(item);
              }}
            />
          )
        }
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
                ? 'Your scratchpad is empty. Tap Back to Camera to snap a temporary photo.'
                : currentTab === 'grace'
                ? 'Photos that expire will wait here for recovery before being wiped.'
                : 'Photos you chose to keep permanently are stored here safely.'}
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

      {/* Floating Batch Actions Deck (when photos are selected) */}
      {isSelectMode && selectedIds.size > 0 && (
        <View style={styles.floatingBatchDeck}>
          <Text style={styles.batchLabel}>{selectedIds.size} SELECTED</Text>
          <View style={styles.batchButtonsRow}>
            {currentTab === 'active' && (
              <GlassButton
                title="+2H"
                size="sm"
                onPress={handleBatchExtend}
                style={styles.batchBtn}
              />
            )}
            <GlassButton
              title="KEEP ALL"
              size="sm"
              isActive
              onPress={handleBatchKeep}
              style={styles.batchBtn}
            />
            <GlassButton
              title={currentTab === 'active' ? 'PURGE ALL' : 'ERASE ALL'}
              size="sm"
              onPress={handleBatchPurge}
              style={styles.batchBtn}
            />
          </View>
        </View>
      )}
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
    paddingBottom: 12,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#0C0C0E',
    borderBottomWidth: 1,
    borderBottomColor: '#202024',
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    minWidth: 76,
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#16161C',
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: '#2A2A34',
    gap: 2,
  },
  toggleBtn: {
    minWidth: 50,
  },
  selectBtn: {
    minWidth: 120,
  },
  selectBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: '#14141A',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2C2C36',
  },
  selectStatus: {
    ...Typography.caption,
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '700',
  },
  selectAllBtn: {
    minWidth: 90,
  },
  listContentContainer: {
    padding: Spacing.md,
    paddingBottom: 40,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111116',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#22222A',
    padding: 10,
    gap: 12,
  },
  listItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#141B26',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#52525B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  listThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#1E1E24',
  },
  listContent: {
    flex: 1,
    gap: 4,
  },
  listNote: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listMeta: {
    fontSize: 11,
    color: '#71717A',
  },
  listRight: {
    alignItems: 'flex-end',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  graceBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  keeperBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E4E4E7',
    letterSpacing: 0.5,
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
  floatingBatchDeck: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(18, 18, 24, 0.95)',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
  },
  batchLabel: {
    ...Typography.caption,
    fontWeight: '800',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginLeft: 4,
  },
  batchButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  batchBtn: {
    minWidth: 70,
  },
});
