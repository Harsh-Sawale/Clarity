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
import { GlassButton } from '../components/GlassButton';

interface PreviewModalProps {
  visible: boolean;
  photoUri: string | null;
  onConfirm: (durationMs: number, groupName?: string, note?: string) => void;
  onRetake: () => void;
}

type CustomUnit = 'minutes' | 'hours' | 'days';

export const PreviewModal: React.FC<PreviewModalProps> = ({
  visible,
  photoUri,
  onConfirm,
  onRetake,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(PRESET_DURATIONS[1].value); // Default 2h
  const [customValue, setCustomValue] = useState<string>('12');
  const [customUnit, setCustomUnit] = useState<CustomUnit>('hours');
  const [note, setNote] = useState<string>('');

  if (!photoUri) return null;

  const calculateFinalDuration = (): number => {
    if (typeof selectedPreset === 'number') {
      return selectedPreset;
    }

    const num = Math.max(1, parseInt(customValue, 10) || 1);
    if (customUnit === 'minutes') {
      return Math.min(num, 60 * 24 * 7) * 60 * 1000;
    }
    if (customUnit === 'hours') {
      return Math.min(num, 24 * 7) * 60 * 60 * 1000;
    }
    // Days: up to 7 days (1 week)
    return Math.min(num, 7) * 24 * 60 * 60 * 1000;
  };

  const handleSave = () => {
    const durationMs = calculateFinalDuration();
    onConfirm(durationMs, undefined, note.trim() || undefined);
    setNote('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Top Bar with Clear Retake Button */}
          <View style={styles.topBar}>
            <GlassButton
              title="< RETAKE"
              size="sm"
              onPress={onRetake}
              style={styles.retakeBtn}
            />
            <Text style={styles.headerTitle}>SCRATCH PREVIEW</Text>
            <View style={{ width: 85 }} />
          </View>

          {/* Large Photo Preview Box */}
          <View style={styles.previewBox}>
            <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />
          </View>

          {/* Clean, Non-Crowded Controls Drawer */}
          <View style={styles.controlsSheet}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
              {/* Lifespan Preset Pills */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>LIFESPAN DURATION</Text>
                <View style={styles.durationRow}>
                  {PRESET_DURATIONS.map((preset) => (
                    <GlassButton
                      key={preset.label}
                      title={preset.label}
                      size="md"
                      isActive={selectedPreset === preset.value}
                      onPress={() => setSelectedPreset(preset.value)}
                      style={styles.presetButton}
                    />
                  ))}
                  <GlassButton
                    title="CUSTOM"
                    size="md"
                    isActive={selectedPreset === 'custom'}
                    onPress={() => setSelectedPreset('custom')}
                    style={styles.presetButton}
                  />
                </View>
              </View>

              {/* Custom Timer Controls (1 min to 1 week) */}
              {selectedPreset === 'custom' && (
                <View style={styles.customCard}>
                  <Text style={styles.customCardLabel}>ENTER CUSTOM TIME (1 MIN TO 1 WEEK)</Text>
                  <View style={styles.customInputRow}>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="number-pad"
                      value={customValue}
                      onChangeText={(txt) => setCustomValue(txt.replace(/[^0-9]/g, ''))}
                      maxLength={4}
                      placeholder="1"
                      placeholderTextColor={Colors.textMuted}
                    />
                    <View style={styles.unitPillsRow}>
                      <GlassButton
                        title="MINS"
                        size="sm"
                        isActive={customUnit === 'minutes'}
                        onPress={() => setCustomUnit('minutes')}
                        style={styles.unitBtn}
                      />
                      <GlassButton
                        title="HOURS"
                        size="sm"
                        isActive={customUnit === 'hours'}
                        onPress={() => setCustomUnit('hours')}
                        style={styles.unitBtn}
                      />
                      <GlassButton
                        title="DAYS"
                        size="sm"
                        isActive={customUnit === 'days'}
                        onPress={() => setCustomUnit('days')}
                        style={styles.unitBtn}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Optional Memo Field */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>OPTIONAL MEMO</Text>
                <View style={styles.memoCard}>
                  <TextInput
                    style={styles.memoInput}
                    placeholder="Add a quick note (e.g. Wi-Fi password, Pillar B4)..."
                    placeholderTextColor={Colors.textMuted}
                    value={note}
                    onChangeText={setNote}
                    maxLength={80}
                  />
                </View>
              </View>

              {/* Immersive Primary Save Button */}
              <GlassButton
                title="SAVE SCRATCH PHOTO"
                size="lg"
                isActive
                onPress={handleSave}
                style={styles.saveActionBtn}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: statusBarHeight + 10,
    paddingBottom: 12,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#0A0A0C',
    borderBottomWidth: 1,
    borderBottomColor: '#202024',
  },
  retakeBtn: {
    minWidth: 85,
  },
  headerTitle: {
    ...Typography.caption,
    color: '#FFFFFF',
    letterSpacing: 2,
    fontWeight: '800',
    fontSize: 11,
  },
  previewBox: {
    flex: 1,
    backgroundColor: '#060608',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controlsSheet: {
    backgroundColor: '#0E0E12',
    borderTopWidth: 1,
    borderTopColor: '#222228',
    paddingHorizontal: Spacing.md,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    maxHeight: 330,
  },
  sheetScroll: {
    gap: 14,
    paddingBottom: 12,
  },
  sectionBlock: {
    gap: 6,
  },
  sectionLabel: {
    ...Typography.badge,
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetButton: {
    flex: 1,
  },
  customCard: {
    backgroundColor: '#16161C',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A34',
    gap: 8,
  },
  customCardLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numberInput: {
    width: 60,
    height: 42,
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: '#32323E',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  unitPillsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  unitBtn: {
    flex: 1,
  },
  memoCard: {
    backgroundColor: '#16161C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A34',
    paddingHorizontal: 12,
  },
  memoInput: {
    height: 44,
    color: '#FFFFFF',
    fontSize: 13,
  },
  saveActionBtn: {
    marginTop: 4,
    borderRadius: 16,
    paddingVertical: 16,
  },
});
