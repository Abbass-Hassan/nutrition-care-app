import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

const AnimatedSplash = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Loading dots animation
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dot1Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animateDots());
    };

    setTimeout(() => animateDots(), 500);

    // Finish after 2.5 seconds
    if (onFinish) {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onFinish());
      }, 2500);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Background decorative circles */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />
      <View style={[styles.decorCircle, styles.decorCircle3]} />
      <View style={[styles.decorCircle, styles.decorCircle4]} />

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Icon container */}
        <View style={styles.iconContainer}>
          {/* Circular background */}
          <View style={styles.iconCircle}>
            {/* Apple shape with text */}
            <View style={styles.appleContainer}>
              <Text style={styles.appleEmoji}>🍎</Text>
              <View style={styles.heartOverlay}>
                <Text style={styles.heartEmoji}>💚</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App name */}
        <Text style={styles.appName}>Nutrition Care</Text>
        <Text style={styles.tagline}>Your Health Journey</Text>

        {/* Loading dots */}
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: 100,
    left: -50,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    top: 150,
    right: -30,
  },
  decorCircle3: {
    width: 180,
    height: 180,
    bottom: 200,
    left: -40,
  },
  decorCircle4: {
    width: 160,
    height: 160,
    bottom: 150,
    right: -50,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  appleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleEmoji: {
    fontSize: 100,
  },
  heartOverlay: {
    position: 'absolute',
    bottom: 10,
  },
  heartEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginHorizontal: 8,
  },
});

export default AnimatedSplash;


