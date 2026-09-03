import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

type CameraFacing = 'front' | 'back';
import { Colors, Spacing, Typography } from '../theme/colors';
import { ShutterButton } from '../components/ShutterButton';
import { PreviewModal } from './PreviewModal';
import { saveCapturedPhoto } from '../services/storage';
import { CategoryTag } from '../types';

interface CameraScreenProps {
  onPhotoSaved: () => void;
  onNavigateToLimbo: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onPhotoSaved,
  onNavigateToLimbo,
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
          <Text style={Typography.titleLarge}>Camera Access Required</Text>
          <Text style={[Typography.bodyMedium, styles.permissionDescription]}>
            Clarity needs camera access to capture temporary visual scratch notes. All photos remain
            100% sandboxed on your device and are never synced to any server.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permissionButton}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
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
    tag?: CategoryTag,
    note?: string
  ) => {
    if (capturedUri) {
      await saveCapturedPhoto({
        tempUri: capturedUri,
        durationMs,
        tag,
        note,
      });
      setCapturedUri(null);
      onPhotoSaved();
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
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
          {/* Top Control Bar */}
          <View style={styles.topControls}>
            <TouchableOpacity
              onPress={toggleTorch}
              style={[styles.pillButton, torch && styles.pillButtonActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillButtonText, torch && styles.pillButtonTextActive]}>
                Torch: {torch ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleFacing}
              style={styles.pillButton}
              activeOpacity={0.7}
            >
              <Text style={styles.pillButtonText}>Flip</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Shutter & Navigation Bar */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              onPress={onNavigateToLimbo}
              style={styles.trayButton}
              activeOpacity={0.7}
            >
              <Text style={styles.trayButtonText}>Limbo</Text>
            </TouchableOpacity>

            <ShutterButton onPress={handleCapture} disabled={isCapturing} />

            <View style={{ width: 60 }} />
          </View>
        </SafeAreaView>
      </CameraView>

      {/* Post-Capture Inspection Modal */}
      <PreviewModal
        visible={!!capturedUri}
        photoUri={capturedUri}
        onConfirm={handleConfirmSave}
        onRetake={handleRetake}
      />
    </View>
  );
};

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
    padding: Spacing.md,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  pillButton: {
    backgroundColor: Colors.overlay,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  pillButtonActive: {
    backgroundColor: Colors.textPrimary,
  },
  pillButtonText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  pillButtonTextActive: {
    color: Colors.background,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Spacing.lg,
  },
  trayButton: {
    backgroundColor: Colors.overlay,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  trayButtonText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
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
    gap: 12,
  },
  permissionDescription: {
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  permissionButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  permissionButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
