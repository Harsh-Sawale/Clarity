import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';
import { PRESET_DURATIONS, CATEGORY_DEFAULTS } from '../config/maintainer';
import { CategoryTag } from '../types';
import { TagChip } from '../components/TagChip';

interface PreviewModalProps {
  visible: boolean;
  photoUri: string | null;
  onConfirm: (durationMs: number, tag?: CategoryTag, note?: string) => void;
  onRetake: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  visible,
  photoUri,
  onConfirm,
  onRetake,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(PRESET_DURATIONS[1].value); // Default 2h
  const [selectedTag, setSelectedTag] = useState<CategoryTag | undefined>(undefined);
  const [note, setNote] = useState<string>('');

  if (!photoUri) return null;

  const handleTagPress = (tag: CategoryTag) => {
    if (selectedTag === tag) {
      setSelectedTag(undefined);
    } else {
      setSelectedTag(tag);
      if (CATEGORY_DEFAULTS[tag]) {
        setSelectedDuration(CATEGORY_DEFAULTS[tag].defaultDurationMs);
      }
    }
  };

  const handleSave = () => {
    onConfirm(selectedDuration, selectedTag, note.trim() || undefined);
    setNote('');
    setSelectedTag(undefined);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onRetake} style={styles.textButton} activeOpacity={0.7}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            <Text style={Typography.caption}>POST-CAPTURE INSPECTION</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Photo Preview Container */}
          <View style={styles.previewBox}>
            <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />
          </View>

          {/* Controls Sheet */}
          <View style={styles.controlsSheet}>
            {/* Tag Selection */}
            <View style={styles.sectionRow}>
              <Text style={[Typography.caption, styles.sectionLabel]}>CATEGORY</Text>
              <View style={styles.chipRow}>
                {(['parking', 'receipt', 'pass', 'note'] as CategoryTag[]).map((tag) => (
                  <TagChip
                    key={tag}
                    label={tag.toUpperCase()}
                    isSelected={selectedTag === tag}
                    onPress={() => handleTagPress(tag)}
                  />
                ))}
              </View>
            </View>

            {/* Lifespan Selection */}
            <View style={styles.sectionRow}>
              <Text style={[Typography.caption, styles.sectionLabel]}>LIFESPAN</Text>
              <View style={styles.chipRow}>
                {PRESET_DURATIONS.map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => setSelectedDuration(preset.value)}
                    style={[
                      styles.durationButton,
                      selectedDuration === preset.value && styles.durationButtonActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        selectedDuration === preset.value && styles.durationTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Memo Note Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Optional text memo (e.g. Row 4, Pillar C)..."
                placeholderTextColor={Colors.textMuted}
                value={note}
                onChangeText={setNote}
                maxLength={80}
              />
            </View>

            {/* Confirm Save Action Button */}
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>Confirm & Save to Limbo</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  textButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  retakeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  previewBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controlsSheet: {
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionRow: {
    gap: 6,
  },
  sectionLabel: {
    color: Colors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: Colors.textPrimary,
    backgroundColor: Colors.textPrimary,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  durationTextActive: {
    color: Colors.background,
  },
  inputContainer: {
    marginTop: 4,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
  },
  input: {
    height: 40,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
