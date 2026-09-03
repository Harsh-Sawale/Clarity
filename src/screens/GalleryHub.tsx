import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { PhotoItem, PhotoStatus } from '../types';
import { Colors, Spacing, Typography } from '../theme/colors';
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
import { loadUserSettings } from '../services/settings';

type SubTab = 'active' | 'grace' | 'keeper';
type ViewMode = 'list' | 'grid';

interface GalleryHubProps {
  onBackToCamera: () => void;
  onSelectPhoto: (item: PhotoItem) => void;
  onNavigateToSettings: () => void;
}

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - Spacing.md * 2 - 12) / 2;

export const GalleryHub: React.FC<GalleryHubProps> = ({
  onBackToCamera,
  onSelectPhoto,
  onNavigateToSettings,
}) => {
  const [currentTab, setCurrentTab] = useState<SubTab>('active');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const tabScaleAnim = useRef(new Animated.Value(1)).current;

  // Load user's default layout setting on mount
  useEffect(() => {
    loadUserSettings().then((s) => {
      if (s.defaultViewMode) setViewMode(s.defaultViewMode);
    });
  }, []);

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

  // Liquid Tab Switch Animation
  const switchTab = (nextTab: SubTab) => {
    if (nextTab === currentTab) return;
    Animated.parallel([
      Animated.timing(tabFadeAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
      Animated.timing(tabScaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setCurrentTab(nextTab);
      setSelectedIds(new Set());
      setIsSelectMode(false);
      Animated.parallel([
        Animated.timing(tabFadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(tabScaleAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      ]).start();
    });
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
      'Batch Move',
      `Move ${ids.length} photos to the 24-hour Trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
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
  const handleKeepSingle = async (item: PhotoItem) => {
    await moveToKeepers(item.id);
    await loadData();
  };

  const handlePurgeSingle = async (item: PhotoItem) => {
    await moveToGraceLounge(item.id);
    await loadData();
  };

  const handleResurrectSingle = async (item: PhotoItem) => {
    await resurrectFromGrace(item.id, 2 * 60 * 60 * 1000);
    await loadData();
  };

  const handleDeleteSingle = async (item: PhotoItem) => {
    Alert.alert('Erase Photo', 'Permanently wipe this photo from your phone?', [
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

  // Render High-Density List Item (Chunkier, comfortable tap areas)
  const renderListItem = (item: PhotoItem) => {
    const isSelected = selectedIds.has(item.id);
    const dateFormatted = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Pressable
        style={({ pressed }) => [
          styles.listItem,
          isSelected && styles.listItemSelected,
          pressed && styles.listItemPressed,
        ]}
        onPress={() => {
          if (isSelectMode) toggleSelectPhoto(item.id);
          else onSelectPhoto(item);
        }}
        onLongPress={() => {
          setIsSelectMode(true);
          toggleSelectPhoto(item.id);
        }}
      >
        {/* Large 28x28 iOS Checkbox */}
        {isSelectMode && (
          <View style={[styles.largeCheckbox, isSelected && styles.largeCheckboxActive]}>
            {isSelected && <Text style={styles.checkMark}>✓</Text>}
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
              <Text style={styles.badgeText}>IN TRASH</Text>
            </View>
          )}
          {currentTab === 'keeper' && (
            <View style={[styles.badgePill, styles.keeperBadge]}>
              <Text style={styles.badgeText}>SAVED</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  // Render 2-Column Grid Item (Chunkier visual cards)
  const renderGridItem = (item: PhotoItem) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.gridCard,
          isSelected && styles.gridCardSelected,
          pressed && styles.gridCardPressed,
        ]}
        onPress={() => {
          if (isSelectMode) toggleSelectPhoto(item.id);
          else onSelectPhoto(item);
        }}
        onLongPress={() => {
          setIsSelectMode(true);
          toggleSelectPhoto(item.id);
        }}
      >
        <Image source={{ uri: item.uri }} style={styles.gridThumb} />

        {/* Floating Top Checkbox in Select Mode */}
        {isSelectMode && (
          <View style={[styles.gridCheckbox, isSelected && styles.largeCheckboxActive]}>
            {isSelected && <Text style={styles.checkMark}>✓</Text>}
          </View>
        )}

        {/* Floating Bottom Badge */}
        <View style={styles.gridOverlay}>
          <Text style={styles.gridBadgeText}>
            {currentTab === 'active'
              ? formatRemainingTime(item.expiresAt)
              : currentTab === 'grace'
              ? 'TRASH'
              : 'SAVED'}
          </Text>
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
            size="md"
            onPress={onBackToCamera}
            style={styles.navBtn}
          />
          <Text style={styles.hubTitle}>VAULT & ALBUMS</Text>
          <GlassButton
            title="SETTINGS"
            size="md"
            onPress={onNavigateToSettings}
            style={styles.navBtn}
          />
        </View>

        {/* Liquid Glass Segment Slider with Chunkier Pill Buttons */}
        <View style={styles.tabBar}>
          <GlassButton
            title={`PHOTOS (${currentTab === 'active' ? photos.length : ''})`}
            size="sm"
            isActive={currentTab === 'active'}
            onPress={() => switchTab('active')}
            style={styles.tabItem}
          />
          <GlassButton
            title="TRASH (24H)"
            size="sm"
            isActive={currentTab === 'grace'}
            onPress={() => switchTab('grace')}
            style={styles.tabItem}
          />
          <GlassButton
            title="SAVED FOREVER"
            size="sm"
            isActive={currentTab === 'keeper'}
            onPress={() => switchTab('keeper')}
            style={styles.tabItem}
          />
        </View>

        {/* View Mode & Multi-Select Bar with Larger Hit Targets */}
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

      {/* Select All Sub-Bar when in Select Mode */}
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

      {/* Main Liquid Animated Viewport */}
      <Animated.View
        style={[
          styles.viewportContent,
          {
            opacity: tabFadeAnim,
            transform: [{ scale: tabScaleAnim }],
          },
        ]}
      >
        <FlatList
          key={viewMode} // Re-render FlatList when switching columns
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          contentContainerStyle={[
            styles.listContentContainer,
            isSelectMode && selectedIds.size > 0 && { paddingBottom: 120 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors.textPrimary}
            />
          }
          renderItem={({ item }) =>
            viewMode === 'list' ? renderListItem(item) : renderGridItem(item)
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={Typography.titleMedium}>
                {currentTab === 'active'
                  ? 'Camera Roll is Clean'
                  : currentTab === 'grace'
                  ? 'Trash is Empty'
                  : 'No Saved Photos'}
              </Text>
              <Text style={[Typography.bodyMedium, styles.emptySubtext]}>
                {currentTab === 'active'
                  ? 'No temporary photos right now. Snap a photo and it will appear here.'
                  : currentTab === 'grace'
                  ? 'Expired photos sit here for 24 hours just in case you need them back.'
                  : 'Any temporary photo you choose to keep forever will be safely stored here.'}
              </Text>
              {currentTab === 'active' && (
                <GlassButton
                  title="SNAP A SCRATCH PHOTO"
                  size="lg"
                  isActive
                  onPress={onBackToCamera}
                  style={styles.snapBtn}
                />
              )}
            </View>
          }
        />
      </Animated.View>

      {/* Floating Batch Actions Deck with Chunkier, Tactile Controls */}
      {isSelectMode && selectedIds.size > 0 && (
        <View style={styles.floatingBatchDeck}>
          <Text style={styles.batchLabel}>{selectedIds.size} SELECTED</Text>
          <View style={styles.batchButtonsRow}>
            {currentTab === 'active' && (
              <GlassButton
                title="+2H"
                size="md"
                onPress={handleBatchExtend}
                style={styles.batchBtn}
              />
            )}
            <GlassButton
              title="KEEP ALL"
              size="md"
              isActive
              onPress={handleBatchKeep}
              style={styles.batchBtn}
            />
            <GlassButton
              title={currentTab === 'active' ? 'TRASH ALL' : 'ERASE ALL'}
              size="md"
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
  viewportContent: {
    flex: 1,
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
  navBtn: {
    minWidth: 90,
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
    borderRadius: 24,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#282830',
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
    borderRadius: 18,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#2A2A34',
    gap: 3,
  },
  toggleBtn: {
    minWidth: 64,
  },
  selectBtn: {
    minWidth: 130,
  },
  selectBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: '#14141A',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2C2C36',
  },
  selectStatus: {
    ...Typography.caption,
    color: '#D4D4D8',
    fontSize: 12,
    fontWeight: '800',
  },
  selectAllBtn: {
    minWidth: 100,
  },
  listContentContainer: {
    padding: Spacing.md,
    paddingBottom: 40,
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111116',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#24242E',
    padding: 12,
    gap: 14,
    minHeight: 74,
  },
  listItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#121A28',
  },
  listItemPressed: {
    backgroundColor: '#181820',
  },
  largeCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#60606C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  largeCheckboxActive: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  listThumb: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#1E1E24',
  },
  listContent: {
    flex: 1,
    gap: 4,
  },
  listNote: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listMeta: {
    fontSize: 12,
    color: '#71717A',
  },
  listRight: {
    alignItems: 'flex-end',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  graceBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444',
  },
  keeperBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderColor: '#3B82F6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Grid layout styles
  gridRow: {
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH * 1.25,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111116',
    borderWidth: 1.5,
    borderColor: '#24242E',
    marginBottom: 12,
  },
  gridCardSelected: {
    borderColor: '#3B82F6',
  },
  gridCardPressed: {
    opacity: 0.85,
  },
  gridThumb: {
    width: '100%',
    height: '100%',
  },
  gridCheckbox: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(12, 12, 16, 0.85)',
    borderRadius: 8,
    paddingVertical: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  gridBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
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
    marginTop: 8,
  },
  floatingBatchDeck: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(20, 20, 28, 0.95)',
    borderRadius: 26,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
  },
  batchLabel: {
    ...Typography.caption,
    fontWeight: '800',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginLeft: 6,
  },
  batchButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  batchBtn: {
    minWidth: 80,
  },
});
