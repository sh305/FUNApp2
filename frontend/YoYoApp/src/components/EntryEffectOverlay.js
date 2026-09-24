import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AvatarWithFrame } from './AvatarWithFrame';

export const EntryEffectOverlay = ({ entryData, onDismiss }) => {
  const slideAnim = React.useRef(new Animated.Value(-350)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (entryData) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
        ])
      ).start();

      const timer = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        }).start(() => {
          onDismiss();
        });
      }, 3400);

      return () => clearTimeout(timer);
    }
  }, [entryData]);

  if (!entryData) return null;

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <Animated.View
        style={[
          styles.bannerBox,
          {
            transform: [{ translateX: slideAnim }, { scale: pulseAnim }],
            opacity: opacityAnim
          }
        ]}
      >
        {/* Left Side: Real User Avatar with Animated Frame & Crown */}
        <View style={styles.avatarCol}>
          <AvatarWithFrame
            avatarUrl={entryData.avatarUrl}
            frameId={entryData.activeFrameId || (entryData.userLevel >= 15 ? 3 : 2)}
            userLevel={entryData.userLevel || 1}
            size={38}
            showLevel={false}
          />
        </View>

        {/* Center: Royal VIP Welcoming Text & Level Badge */}
        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            <View style={styles.vipPill}>
              <Text style={styles.vipPillIcon}>👑</Text>
              <Text style={styles.vipPillText}>VIP ENTRANCE</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lv.{entryData.userLevel || 1}</Text>
            </View>
          </View>

          <Text style={styles.userNameText} numberOfLines={1}>
            {entryData.displayName || 'Guest User'}
          </Text>
          <Text style={styles.subText}>dazzled into the voice lounge ✨</Text>
        </View>

        {/* Right Star Decoration */}
        <View style={styles.sparkleCol}>
          <Text style={styles.sparkleIcon}>✦</Text>
          <Text style={styles.sparkleIconSmall}>✧</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 94,
    left: 14,
    right: 14,
    zIndex: 9998,
    alignItems: 'center'
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 8, 52, 0.95)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 12,
    width: '100%',
    maxWidth: 390,
    gap: 10
  },
  avatarCol: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContainer: {
    flex: 1
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2
  },
  vipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    gap: 3
  },
  vipPillIcon: {
    fontSize: 9
  },
  vipPillText: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  levelBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6
  },
  levelBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800'
  },
  userNameText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  subText: {
    color: '#c084fc',
    fontSize: 10,
    marginTop: 1
  },
  sparkleCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4
  },
  sparkleIcon: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold'
  },
  sparkleIconSmall: {
    color: '#e879f9',
    fontSize: 10
  }
});
