import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, Typography } from '../theme/colors';
import { ShutterButton } from '../components/ShutterButton';
import { GlassButton } from '../components/GlassButton';
import { PreviewModal } from './PreviewModal';
import { saveCapturedPhoto } from '../services/storage';

type CameraFacing = 'front' | 'back';

interface CameraScreenProps {
  onPhotoSaved: () => void;
  onNavigateToGallery: () => void;
  onNavigateToInfo: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onPhotoSaved,
  onNavigateToGallery,
  onNavigateToInfo,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [torch, setTorch] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(0); // 0 = 1x, 0.35 = 2x, 0.7 = 3x
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.darkBackground} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Text style={Typography.titleLarge}>Camera Access Needed</Text>
          <Text style={[Typography.bodyMedium, styles.permissionDescription]}>
            Clarity needs camera access to capture temporary visual scratch notes. All photos remain
            100% on this phone and are never synced to any server.
          </Text>
          <GlassButton
            title="GRANT CAMERA ACCESS"
            onPress={requestPermission}
            size="lg"
            isActive
            style={styles.permissionBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
      });

      if (photo?.uri) {
        setCapturedUri(photo.uri);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleConfirmSave = async (
    durationMs: number,
    groupName?: string,
    note?: string
  ) => {
    if (capturedUri) {
      await saveCapturedPhoto({
        tempUri: capturedUri,
        durationMs,
        groupName,
        note,
      });
      setCapturedUri(null);
      onPhotoSaved();
    }
  };

  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  const toggleFacing = () => {
    setFacing((prev: CameraFacing) => (prev === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={torch}
        zoom={zoom}
      />

      {/* Touch-safe HUD Overlay with pointerEvents="box-none" */}
      <View style={styles.hudOverlay} pointerEvents="box-none">
        {/* Top Control Bar with Notch Clearance */}
        <View style={styles.topBar} pointerEvents="box-none">
          <GlassButton
            title={torch ? 'TORCH ON' : 'TORCH'}
            isActive={torch}
            onPress={toggleTorch}
            size="md"
            style={styles.topButton}
          />

          <View style={styles.brandPill}>
            <Text style={styles.brandText}>CLARITY</Text>
          </View>

          <GlassButton
            title="FLIP"
            onPress={toggleFacing}
            size="md"
            style={styles.topButton}
          />
        </View>

        {/* Bottom Section: Zoom Selector + Floating Glass Control Island */}
        <View style={styles.bottomSection} pointerEvents="box-none">
          {/* Zoom Selector Bar (1x, 2x, 3x) */}
          <View style={styles.zoomPillContainer} pointerEvents="auto">
            <GlassButton
              title="1x"
              size="sm"
              isActive={zoom === 0}
              onPress={() => setZoom(0)}
              style={styles.zoomButton}
            />
            <GlassButton
              title="2x"
              size="sm"
              isActive={zoom === 0.35}
              onPress={() => setZoom(0.35)}
              style={styles.zoomButton}
            />
            <GlassButton
              title="3x"
              size="sm"
              isActive={zoom === 0.7}
              onPress={() => setZoom(0.7)}
              style={styles.zoomButton}
            />
          </View>

          {/* Floating Control Deck: Gallery, Shutter, Info */}
          <View style={styles.bottomDeck} pointerEvents="auto">
            <GlassButton
              title="GALLERY"
              size="md"
              onPress={onNavigateToGallery}
              style={styles.sideButton}
            />

            <View style={styles.shutterContainer}>
              <ShutterButton onPress={handleCapture} disabled={isCapturing} />
            </View>

            <GlassButton
              title="INFO"
              size="md"
              onPress={onNavigateToInfo}
              style={styles.sideButton}
            />
          </View>
        </View>
      </View>

      {/* Post-Capture Inspection Modal */}
      <PreviewModal
        visible={!!capturedUri}
        photoUri={capturedUri}
        onConfirm={handleConfirmSave}
        onRetake={() => setCapturedUri(null)}
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
  darkBackground: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: statusBarHeight + 14,
    paddingBottom: Platform.OS === 'android' ? 36 : 28,
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  topButton: {
    minWidth: 90,
  },
  brandPill: {
    backgroundColor: 'rgba(15, 15, 20, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#E4E4E7',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  zoomPillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 15, 20, 0.8)',
    padding: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 4,
  },
  zoomButton: {
    minWidth: 44,
  },
  bottomDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  sideButton: {
    width: 92,
  },
  shutterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permissionCard: {
    backgroundColor: '#141416',
    padding: Spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#28282D',
    gap: 16,
  },
  permissionDescription: {
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  permissionBtn: {
    marginTop: 8,
  },
});
