import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  GestureResponderEvent,
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
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onPhotoSaved,
  onNavigateToGallery,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [torch, setTorch] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(0);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const cameraRef = useRef<CameraView>(null);
  const initialDistance = useRef<number | null>(null);
  const initialZoom = useRef<number>(0);

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

  // Two-Finger Pinch-to-Zoom Gesture Handlers
  const handleTouchStart = (e: GestureResponderEvent) => {
    if (e.nativeEvent.touches.length === 2) {
      const [t1, t2] = e.nativeEvent.touches;
      initialDistance.current = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
      initialZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (e.nativeEvent.touches.length === 2 && initialDistance.current !== null) {
      const [t1, t2] = e.nativeEvent.touches;
      const currentDistance = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
      const delta = (currentDistance - initialDistance.current) / 300;
      const newZoom = Math.max(0, Math.min(1, initialZoom.current + delta));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    initialDistance.current = null;
  };

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
    setFacing((prev: CameraFacing) => {
      const next = prev === 'back' ? 'front' : 'back';
      if (next === 'front') setTorch(false); // Front cameras do not support hardware torch
      return next;
    });
  };

  const safeTorch = facing === 'back' ? torch : false;
  const safeZoom = Math.max(0, Math.min(1, zoom));

  return (
    <View
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={safeTorch}
        zoom={safeZoom}
        ratio="4:3"
      />

      {/* Touch-Safe HUD Overlay */}
      <View style={styles.hudOverlay} pointerEvents="box-none">
        {/* Top Bar: Torch on Far Left, Flip on Far Right (Zero Collisions) */}
        <View style={styles.topBar} pointerEvents="box-none">
          <GlassButton
            title={safeTorch ? 'TORCH ON' : 'TORCH'}
            isActive={safeTorch}
            onPress={toggleTorch}
            size="md"
            style={styles.cornerButton}
          />

          <GlassButton
            title="FLIP"
            onPress={toggleFacing}
            size="md"
            style={styles.cornerButton}
          />
        </View>

        {/* Bottom Section: Zoom Bar + Shutter + Gallery Jump */}
        <View style={styles.bottomSection} pointerEvents="box-none">
          {/* Zoom Selector Bar (1x, 2x, 3x) + Pinch Indicator */}
          <View style={styles.zoomPillContainer} pointerEvents="auto">
            <GlassButton
              title="1x"
              size="sm"
              isActive={safeZoom < 0.2}
              onPress={() => setZoom(0)}
              style={styles.zoomButton}
            />
            <GlassButton
              title="2x"
              size="sm"
              isActive={safeZoom >= 0.2 && safeZoom < 0.55}
              onPress={() => setZoom(0.35)}
              style={styles.zoomButton}
            />
            <GlassButton
              title="3x"
              size="sm"
              isActive={safeZoom >= 0.55}
              onPress={() => setZoom(0.7)}
              style={styles.zoomButton}
            />
          </View>

          {/* Bottom Deck: Gallery on Left, Shutter in Center, Balanced Spacer on Right */}
          <View style={styles.bottomDeck} pointerEvents="auto">
            <GlassButton
              title="VAULT"
              size="md"
              onPress={onNavigateToGallery}
              style={styles.sideButton}
            />

            <View style={styles.shutterContainer}>
              <ShutterButton onPress={handleCapture} disabled={isCapturing} />
            </View>

            {/* Balancer Spacer so shutter stays dead-center with zero collision */}
            <View style={styles.sideSpacer} />
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
    paddingTop: statusBarHeight + 12,
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
  cornerButton: {
    minWidth: 84,
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
    width: 88,
  },
  shutterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSpacer: {
    width: 88,
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
