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
import { TactileButton } from '../components/TactileButton';
import { PreviewModal } from './PreviewModal';
import { saveCapturedPhoto } from '../services/storage';

type CameraFacing = 'front' | 'back';

interface CameraScreenProps {
  onPhotoSaved: () => void;
  onNavigateToActive: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onPhotoSaved,
  onNavigateToActive,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [torch, setTorch] = useState<boolean>(false);
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
            Clarity needs camera access to capture temporary visual notes. Everything stays
            100% on this phone and is never sent to any server.
          </Text>
          <TactileButton
            title="Grant Camera Access"
            onPress={requestPermission}
            style={styles.permissionButton}
            textStyle={styles.permissionButtonText}
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
      >
        <SafeAreaView style={styles.hudOverlay}>
          {/* Top Control Bar - Extra notch clearance */}
          <View style={styles.topControls}>
            <TactileButton
              onPress={toggleTorch}
              style={[styles.circleButton, torch && styles.circleButtonActive]}
            >
              <Text style={[styles.circleButtonText, torch && styles.circleButtonTextActive]}>
                {torch ? 'TORCH ON' : 'TORCH'}
              </Text>
            </TactileButton>

            <View style={styles.centerBrandPill}>
              <Text style={styles.brandText}>CLARITY</Text>
            </View>

            <TactileButton onPress={toggleFacing} style={styles.circleButton}>
              <Text style={styles.circleButtonText}>FLIP</Text>
            </TactileButton>
          </View>

          {/* Bottom Shutter & Navigation Bar with dedicated non-overlapping zones */}
          <View style={styles.bottomControls}>
            <TactileButton onPress={onNavigateToActive} style={styles.galleryJumpButton}>
              <Text style={styles.galleryJumpText}>EXPIRING</Text>
            </TactileButton>

            <View style={styles.shutterCenterBox}>
              <ShutterButton onPress={handleCapture} disabled={isCapturing} />
            </View>

            {/* Balancer spacing block so shutter stays exactly centered */}
            <View style={styles.galleryJumpSpacer} />
          </View>
        </SafeAreaView>
      </CameraView>

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

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  darkBackground: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hudOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: statusBarHeight + 12,
    paddingBottom: 24,
    paddingHorizontal: Spacing.md,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  circleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 74,
  },
  circleButtonActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  circleButtonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textPrimary,
  },
  circleButtonTextActive: {
    color: Colors.background,
  },
  centerBrandPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: Colors.textSecondary,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xs,
  },
  galleryJumpButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: 90,
  },
  galleryJumpText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  shutterCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryJumpSpacer: {
    width: 90,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permissionCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  permissionDescription: {
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  permissionButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  permissionButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
