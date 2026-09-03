import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Typography } from './src/theme/colors';
import { CameraScreen } from './src/screens/CameraScreen';
import { LimboScreen } from './src/screens/LimboScreen';
import { CryptScreen } from './src/screens/CryptScreen';
import { VaultScreen } from './src/screens/VaultScreen';
import { InfoScreen } from './src/screens/InfoScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PhotoDetailModal } from './src/screens/PhotoDetailModal';
import { PhotoItem } from './src/types';
import { moveToVault, permanentlyDelete } from './src/services/storage';

type Tab = 'camera' | 'limbo' | 'crypt' | 'vault' | 'info' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const handlePhotoSaved = () => {
    setActiveTab('limbo');
  };

  const handleVaultPhoto = async (item: PhotoItem) => {
    await moveToVault(item.id);
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
            onNavigateToLimbo={() => setActiveTab('limbo')}
          />
        );
      case 'limbo':
        return (
          <LimboScreen
            onNavigateToCamera={() => setActiveTab('camera')}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
          />
        );
      case 'crypt':
        return <CryptScreen onSelectPhoto={(photo) => setSelectedPhoto(photo)} />;
      case 'vault':
        return <VaultScreen onSelectPhoto={(photo) => setSelectedPhoto(photo)} />;
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

      {/* Bottom Navigation Bar */}
      <SafeAreaView style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('camera')}
            style={[styles.navTab, activeTab === 'camera' && styles.navTabActive]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'camera' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              CAMERA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('limbo')}
            style={[styles.navTab, activeTab === 'limbo' && styles.navTabActive]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'limbo' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              LIMBO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('crypt')}
            style={[styles.navTab, activeTab === 'crypt' && styles.navTabActive]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'crypt' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              CRYPT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('vault')}
            style={[styles.navTab, activeTab === 'vault' && styles.navTabActive]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'vault' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              VAULT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('info')}
            style={[styles.navTab, activeTab === 'info' && styles.navTabActive]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'info' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              INFO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('settings')}
            style={[styles.navTab, activeTab === 'settings' && styles.navTabActive]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navText,
                activeTab === 'settings' ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              CONFIG
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Global Photo Detail Modal */}
      <PhotoDetailModal
        item={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onVault={handleVaultPhoto}
        onDelete={handleDeletePhoto}
      />
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
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  navBar: {
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xs,
  },
  navTab: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabActive: {
    backgroundColor: Colors.surfaceElevated,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  navTextActive: {
    color: Colors.textPrimary,
  },
  navTextInactive: {
    color: Colors.textMuted,
  },
});
