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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          {/* Subtle top specular sheen reflection line */}
          <View style={[styles.specularSheen, isActive && styles.specularSheenActive]} />

          {title ? (
            <Text
              style={[
                styles.titleText,
                size === 'sm' && styles.titleTextSm,
                size === 'lg' && styles.titleTextLg,
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
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  sizeSm: {
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 21,
  },
  sizeMd: {
    minHeight: 52,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 26,
  },
  sizeLg: {
    minHeight: 62,
    paddingHorizontal: 28,
    paddingVertical: 17,
    borderRadius: 31,
  },
  inactiveGlass: {
    backgroundColor: 'rgba(28, 28, 36, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.38)',
  },
  activeGlass: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  inactivePressed: {
    backgroundColor: 'rgba(60, 60, 75, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ scale: 0.91 }],
  },
  activePressed: {
    backgroundColor: 'rgba(235, 235, 240, 0.92)',
    transform: [{ scale: 0.91 }],
  },
  specularSheen: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  specularSheenActive: {
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  titleTextSm: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  titleTextLg: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
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
