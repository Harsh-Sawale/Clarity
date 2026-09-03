import React, { useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface TactileButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  title?: string;
  children?: React.ReactNode;
  activeScale?: number;
  hapticFeedback?: boolean;
  disabled?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  onPress,
  style,
  textStyle,
  title,
  children,
  activeScale = 0.94,
  hapticFeedback = true,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: activeScale,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

    if (hapticFeedback) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics fallback
      }
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.base, style]}
      >
        {title ? <Text style={[styles.baseText, textStyle]}>{title}</Text> : children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
