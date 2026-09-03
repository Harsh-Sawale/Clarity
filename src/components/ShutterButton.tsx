import React, { useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';

interface ShutterButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const ShutterButton: React.FC<ShutterButtonProps> = ({ onPress, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics unavailable on simulator
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.container}
    >
      <View style={styles.outerRing}>
        <Animated.View style={[styles.innerCircle, { transform: [{ scale: scaleAnim }] }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  innerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.textPrimary,
  },
});
