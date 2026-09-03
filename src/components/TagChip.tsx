import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';

interface TagChipProps {
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  isSelected = false,
  onPress,
  size = 'md',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        isSelected ? styles.selected : styles.unselected,
      ]}
    >
      <Text
        style={[
          Typography.badge,
          styles.text,
          isSelected ? styles.textSelected : styles.textUnselected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sizeMd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  unselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  selected: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  text: {
    fontSize: 11,
  },
  textUnselected: {
    color: Colors.textSecondary,
  },
  textSelected: {
    color: Colors.background,
  },
});
