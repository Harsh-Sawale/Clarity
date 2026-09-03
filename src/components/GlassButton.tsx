import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface GlassButtonProps {
  onPress: () => void;
  title?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  onPress,
  title,
  children,
  style,
  textStyle,
  isActive = false,
  size = 'md',
}) => {
  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sizeSm,
        size === 'md' && styles.sizeMd,
        size === 'lg' && styles.sizeLg,
        isActive ? styles.activeGlass : styles.inactiveGlass,
        pressed && (isActive ? styles.activePressed : styles.inactivePressed),
        style,
      ]}
    >
      {({ pressed }) => (
        <View style={styles.contentWrapper}>
          {title ? (
            <Text
              style={[
                styles.titleText,
                size === 'sm' && styles.titleTextSm,
                isActive ? styles.titleActive : styles.titleInactive,
                pressed && styles.titlePressed,
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sizeSm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sizeMd: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  sizeLg: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
  },
  inactiveGlass: {
    backgroundColor: 'rgba(25, 25, 30, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  activeGlass: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  inactivePressed: {
    backgroundColor: 'rgba(50, 50, 60, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ scale: 0.94 }],
  },
  activePressed: {
    backgroundColor: 'rgba(235, 235, 240, 0.9)',
    transform: [{ scale: 0.94 }],
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  titleTextSm: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
  titleInactive: {
    color: '#FFFFFF',
  },
  titleActive: {
    color: '#000000',
  },
  titlePressed: {
    opacity: 0.85,
  },
});
