import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraScreen } from './src/screens/CameraScreen';
import { GalleryHub } from './src/screens/GalleryHub';
import { InfoScreen } from './src/screens/InfoScreen';
import { PhotoDetailModal } from './src/screens/PhotoDetailModal';
import { IntroSplash } from './src/screens/IntroSplash';
import { PhotoItem } from './src/types';
import { moveToKeepers, permanentlyDelete } from './src/services/storage';

type ActiveView = 'camera' | 'gallery' | 'info';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ActiveView>('camera');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

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
            onNavigateToInfo={() => setCurrentView('info')}
          />
        );
      case 'gallery':
        return (
          <GalleryHub
            onBackToCamera={() => setCurrentView('camera')}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
          />
        );
      case 'info':
        return (
          <InfoScreen
            onBackToCamera={() => setCurrentView('camera')}
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

      {/* Cinematic Opening Splash Screen */}
      {showSplash && <IntroSplash onFinish={() => setShowSplash(false)} />}
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
