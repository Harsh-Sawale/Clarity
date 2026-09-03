import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

interface IntroSplashProps {
  onFinish: () => void;
}

const { width } = Dimensions.get('window');

export const IntroSplash: React.FC<IntroSplashProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Elegant entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth exit animation after 1.3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 1300);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, logoRotate, onFinish]);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Minimalist Camera Lens Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ rotate: spin }] }]}>
          <View style={styles.outerLens}>
            <View style={styles.midLens}>
              <View style={styles.innerCore} />
            </View>
            {/* Viewfinder crosshairs */}
            <View style={styles.notchTop} />
            <View style={styles.notchBottom} />
            <View style={styles.notchLeft} />
            <View style={styles.notchRight} />
          </View>
        </Animated.View>

        {/* Brand & Creator Center Block */}
        <View style={styles.textBlock}>
          <Text style={styles.appName}>CLARITY</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>OPEN SOURCE PROJECT</Text>
          </View>
          <Text style={styles.tagline}>The Offline Scratchpad Camera</Text>
        </View>

        {/* Personal Creator Tag */}
        <View style={styles.footerBlock}>
          <Text style={styles.madeByLabel}>MADE BY</Text>
          <Text style={styles.authorName}>Harsh Sawale</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.85,
    gap: 28,
  },
  logoContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerLens: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0E',
  },
  midLens: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121218',
  },
  innerCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  notchTop: {
    position: 'absolute',
    top: -4,
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  notchBottom: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  notchLeft: {
    position: 'absolute',
    left: -4,
    width: 2,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  notchRight: {
    position: 'absolute',
    right: -4,
    width: 2,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#FFFFFF',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#D4D4D8',
  },
  tagline: {
    fontSize: 13,
    color: '#71717A',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  footerBlock: {
    alignItems: 'center',
    gap: 2,
    marginTop: 16,
  },
  madeByLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#52525B',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E4E4E7',
    letterSpacing: 1,
  },
  version: {
    fontSize: 11,
    color: '#3F3F46',
    marginTop: 4,
    letterSpacing: 1,
  },
});
