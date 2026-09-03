import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleGroup}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <Text style={Typography.titleLarge}>{title}</Text>
        {subtitle && <Text style={[Typography.bodyMedium, styles.subtitle]}>{subtitle}</Text>}
      </View>
      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{rightAction.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  titleGroup: {
    flex: 1,
  },
  backButton: {
    marginBottom: Spacing.xs,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 2,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
});
