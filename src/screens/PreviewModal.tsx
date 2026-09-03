import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';
import { PRESET_DURATIONS } from '../config/maintainer';
import { TactileButton } from '../components/TactileButton';

interface PreviewModalProps {
  visible: boolean;
  photoUri: string | null;
  onConfirm: (durationMs: number, groupName?: string, note?: string) => void;
  onRetake: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  visible,
  photoUri,
  onConfirm,
  onRetake,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(PRESET_DURATIONS[1].value); // Default 2h
  const [groupName, setGroupName] = useState<string>('');
  const [note, setNote] = useState<string>('');

  if (!photoUri) return null;

  const handleSave = () => {
    onConfirm(
      selectedDuration,
      groupName.trim() || undefined,
      note.trim() || undefined
    );
    setGroupName('');
    setNote('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Top Bar with clear safe padding */}
          <View style={styles.topBar}>
            <TactileButton onPress={onRetake} style={styles.retakeButton}>
              <Text style={styles.retakeText}>RETAKE</Text>
            </TactileButton>

            <Text style={styles.headerTitle}>INSPECT & SAVE</Text>

            <View style={{ width: 70 }} />
          </View>

          {/* Photo Preview */}
          <View style={styles.previewBox}>
            <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />
          </View>

          {/* Controls Sheet with Dedicated Separate Sections */}
          <View style={styles.controlsSheet}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollGap}>
              {/* Expiration Presets */}
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>KEEP ACTIVE FOR</Text>
                <View style={styles.durationRow}>
                  {PRESET_DURATIONS.map((preset) => (
                    <TactileButton
                      key={preset.label}
                      onPress={() => setSelectedDuration(preset.value)}
                      style={[
                        styles.durationBtn,
                        selectedDuration === preset.value && styles.durationBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.durationBtnText,
                          selectedDuration === preset.value && styles.durationBtnTextActive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TactileButton>
                  ))}
                </View>
              </View>

              {/* Custom User-Defined Group */}
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>CUSTOM GROUP / ALBUM (OPTIONAL)</Text>
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Name a group (e.g. Groceries, Work, Parking, Taxes)..."
                    placeholderTextColor={Colors.textMuted}
                    value={groupName}
                    onChangeText={setGroupName}
                    maxLength={30}
                  />
                </View>
              </View>

              {/* Quick Note */}
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>ATTACH MEMO (OPTIONAL)</Text>
                <View style={styles.inputCard}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Quick note (e.g. Row 4 near elevator, Wi-Fi code)..."
                    placeholderTextColor={Colors.textMuted}
                    value={note}
                    onChangeText={setNote}
                    maxLength={80}
                  />
                </View>
              </View>

              {/* Primary Action Button */}
              <TactileButton
                onPress={handleSave}
                style={styles.confirmButton}
                textStyle={styles.confirmButtonText}
                title="Save Scratch Photo"
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: statusBarHeight + 8,
    paddingBottom: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  retakeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retakeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  headerTitle: {
    ...Typography.caption,
    color: Colors.textPrimary,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  previewBox: {
    flex: 1,
    backgroundColor: '#08080A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controlsSheet: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    maxHeight: 320,
  },
  scrollGap: {
    gap: 12,
    paddingBottom: 16,
  },
  sectionGroup: {
    gap: 6,
  },
  sectionTitle: {
    ...Typography.badge,
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
  },
  durationBtnActive: {
    borderColor: Colors.textPrimary,
    backgroundColor: Colors.textPrimary,
  },
  durationBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  durationBtnTextActive: {
    color: Colors.background,
  },
  inputCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
  },
  textInput: {
    height: 42,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  confirmButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
