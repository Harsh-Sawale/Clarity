import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraScreen } from './src/screens/CameraScreen';
import { GalleryHub } from './src/screens/GalleryHub';
import { InfoScreen } from './src/screens/InfoScreen';
import { PhotoDetailModal } from './src/screens/PhotoDetailModal';
import { IntroSplash } from './src/screens/IntroSplash';
import { PhotoItem } from './src/types';
import { moveToKeepers, permanentlyDelete } from './src/services/storage';

type ActiveView = 'camera' | 'gallery' | 'info';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ActiveView>('camera');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  useEffect(() => {
    // Only display opening splash ONCE on first-ever launch
    AsyncStorage.getItem('@clarity_seen_splash_v1').then((seen) => {
      if (!seen) {
        setShowSplash(true);
      }
    });
  }, []);

  const handleFinishSplash = () => {
    setShowSplash(false);
    AsyncStorage.setItem('@clarity_seen_splash_v1', 'true');
  };

  const handlePhotoSaved = () => {
    setCurrentView('gallery');
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
            onNavigateToGallery={() => setCurrentView('gallery')}
          />
        );
      case 'gallery':
        return (
          <GalleryHub
            onBackToCamera={() => setCurrentView('camera')}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
            onNavigateToInfo={() => setCurrentView('info')}
          />
        );
      case 'info':
        return (
          <InfoScreen
            onBackToCamera={() => setCurrentView('gallery')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Viewport Container */}
      <View style={styles.viewport}>{renderCurrentView()}</View>

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
