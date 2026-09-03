import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraScreen } from './src/screens/CameraScreen';
import { GalleryHub } from './src/screens/GalleryHub';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PhotoDetailModal } from './src/screens/PhotoDetailModal';
import { IntroSplash } from './src/screens/IntroSplash';
import { PhotoItem } from './src/types';
import { moveToKeepers, permanentlyDelete } from './src/services/storage';

type ActiveView = 'camera' | 'gallery' | 'settings';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ActiveView>('camera');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const changeView = (nextView: ActiveView) => {
    // Liquid cross-dissolve with spring scale
    fadeAnim.setValue(0.4);
    scaleAnim.setValue(0.97);
    setCurrentView(nextView);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFinishSplash = () => {
    setShowSplash(false);
    AsyncStorage.setItem('@clarity_seen_splash_v1', 'true');
  };

  const handlePhotoSaved = () => {
    changeView('gallery');
  };

  const handleKeepPhoto = async (item: PhotoItem) => {
    await moveToKeepers(item.id);
  };

  const handleDeletePhoto = async (item: PhotoItem) => {
    await permanentlyDelete(item.id);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'camera':
        return (
          <CameraScreen
            onPhotoSaved={handlePhotoSaved}
            onNavigateToGallery={() => changeView('gallery')}
          />
        );
      case 'gallery':
        return (
          <GalleryHub
            onBackToCamera={() => changeView('camera')}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
            onNavigateToSettings={() => changeView('settings')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => changeView('gallery')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Liquid Viewport */}
      <Animated.View
        style={[
          styles.viewport,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {renderCurrentView()}
      </Animated.View>

      {/* Fullscreen Photo Inspector Modal */}
      <PhotoDetailModal
        item={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onVault={handleKeepPhoto}
        onDelete={handleDeletePhoto}
      />

      {/* Opening Intro Splash Sequence - Only shown once ever */}
      {showSplash && <IntroSplash onFinish={handleFinishSplash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  viewport: {
    flex: 1,
  },
});
