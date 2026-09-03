import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/colors';

interface IntroSplashProps {
  onFinish: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onFinish }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    // Fade in
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 15,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out after 1.4s
    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 1400);

    return () => clearTimeout(timer);
  }, [onFinish, opacityAnim, scaleAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <View style={styles.centerBox}>
        <Animated.Text style={[styles.title, { transform: [{ scale: scaleAnim }] }]}>
          CLARITY
        </Animated.Text>
        <View style={styles.line} />
        <Text style={styles.subtitle}>EPHEMERAL SCRATCHPAD FOR ANDROID</Text>
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerAuthor}>Made by Harsh</Text>
        <Text style={styles.footerVersion}>Version 1.0.0 • Open Source</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 9999,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 8,
  },
  line: {
    width: 48,
    height: 2,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    letterSpacing: 2,
    fontSize: 11,
  },
  footerBox: {
    alignItems: 'center',
    gap: 4,
  },
  footerAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.6,
  },
  footerVersion: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
