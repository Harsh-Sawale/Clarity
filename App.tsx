import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing } from './src/theme/colors';
import { CameraScreen } from './src/screens/CameraScreen';
import { ActiveScreen } from './src/screens/ActiveScreen';
import { GraceScreen } from './src/screens/GraceScreen';
import { KeepersScreen } from './src/screens/KeepersScreen';
import { InfoScreen } from './src/screens/InfoScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PhotoDetailModal } from './src/screens/PhotoDetailModal';
import { IntroSplash } from './src/screens/IntroSplash';
import { TactileButton } from './src/components/TactileButton';
import { PhotoItem } from './src/types';
import { moveToKeepers, permanentlyDelete } from './src/services/storage';

type Tab = 'camera' | 'active' | 'grace' | 'keepers' | 'info' | 'settings';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const handlePhotoSaved = () => {
    setActiveTab('active');
  };

  const handleKeepPhoto = async (item: PhotoItem) => {
    await moveToKeepers(item.id);
  };

  const handleDeletePhoto = async (item: PhotoItem) => {
    await permanentlyDelete(item.id);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'camera':
        return (
          <CameraScreen
            onPhotoSaved={handlePhotoSaved}
            onNavigateToActive={() => setActiveTab('active')}
          />
        );
      case 'active':
        return (
          <ActiveScreen
            onNavigateToCamera={() => setActiveTab('camera')}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
          />
        );
      case 'grace':
        return <GraceScreen onSelectPhoto={(photo) => setSelectedPhoto(photo)} />;
      case 'keepers':
        return <KeepersScreen onSelectPhoto={(photo) => setSelectedPhoto(photo)} />;
      case 'info':
        return <InfoScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Content Area */}
      <View style={styles.contentArea}>{renderScreen()}</View>

      {/* Floating Bottom Navigation Dock with zero overlap */}
      <SafeAreaView style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TactileButton
            onPress={() => setActiveTab('camera')}
            style={[styles.navTab, activeTab === 'camera' && styles.navTabActive]}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'camera' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              CAMERA
            </Text>
          </TactileButton>

          <TactileButton
            onPress={() => setActiveTab('active')}
            style={[styles.navTab, activeTab === 'active' && styles.navTabActive]}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'active' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              EXPIRING
            </Text>
          </TactileButton>

          <TactileButton
            onPress={() => setActiveTab('grace')}
            style={[styles.navTab, activeTab === 'grace' && styles.navTabActive]}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'grace' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              GRACE
            </Text>
          </TactileButton>

          <TactileButton
            onPress={() => setActiveTab('keepers')}
            style={[styles.navTab, activeTab === 'keepers' && styles.navTabActive]}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'keepers' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              KEEPERS
            </Text>
          </TactileButton>

          <TactileButton
            onPress={() => setActiveTab('info')}
            style={[styles.navTab, activeTab === 'info' && styles.navTabActive]}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'info' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              INFO
            </Text>
          </TactileButton>

          <TactileButton
            onPress={() => setActiveTab('settings')}
            style={[styles.navTab, activeTab === 'settings' && styles.navTabActive]}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'settings' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              CONFIG
            </Text>
          </TactileButton>
        </View>
      </SafeAreaView>

      {/* Global Photo Detail Modal */}
      <PhotoDetailModal
        item={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onVault={handleKeepPhoto}
        onDelete={handleDeletePhoto}
      />

      {/* Opening Intro Splash Sequence */}
      {showSplash && <IntroSplash onFinish={() => setShowSplash(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentArea: {
    flex: 1,
  },
  navBarContainer: {
    backgroundColor: '#0A0A0C',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navBar: {
    flexDirection: 'row',
    height: Platform.OS === 'android' ? 56 : 50,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xs,
  },
  navTab: {
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  navText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  navTextActive: {
    color: Colors.textPrimary,
  },
  navTextInactive: {
    color: Colors.textMuted,
  },
});
