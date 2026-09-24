import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { FRAMES } from '../constants/frames';

export const AvatarWithFrame = ({
  avatarUrl,
  frameId,
  userLevel = 1,
  size = 64,
  isSpeaking = false,
  showLevel = true
}) => {
  // Find frame definition
  const frame = FRAMES.find(f => f.id === frameId) || FRAMES[0];
  const frameBorderColor = frame ? frame.borderColor : COLORS.primary;

  // Proportionally scale frame ring, crown and level badge based on size
  const ringExtra = Math.max(10, Math.round(size * 0.2));
  const frameSize = size + ringExtra;
  const avatarSize = size;
  const borderWidth = Math.max(2, Math.round(size * 0.045));
  const crownFontSize = Math.max(10, Math.round(size * 0.22));
  const levelFontSize = Math.max(8, Math.round(size * 0.16));
  const levelBadgeBottom = -Math.round(size * 0.1);

  return (
    <View style={[styles.container, { width: frameSize, height: frameSize }]}>
      {/* Outer Pulse/Speaking Glow */}
      {isSpeaking && (
        <View
          style={[
            styles.speakingRing,
            {
              width: frameSize + 6,
              height: frameSize + 6,
              borderRadius: (frameSize + 6) / 2,
              borderColor: COLORS.seatActive,
              borderWidth: Math.max(1.5, borderWidth * 0.7)
            }
          ]}
        />
      )}

      {/* Frame Border Ring */}
      <View
        style={[
          styles.frameRing,
          {
            width: frameSize,
            height: frameSize,
            borderRadius: frameSize / 2,
            borderWidth: borderWidth,
            borderColor: frameBorderColor,
            shadowColor: frameBorderColor
          }
        ]}
      >
        {/* User Avatar */}
        <Image
          source={{
            uri:
              avatarUrl ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=user_${userLevel}`
          }}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2
            }
          ]}
        />
      </View>

      {/* Frame Icon / Crown at Top Right */}
      {frame && frame.icon && (
        <View
          style={[
            styles.crownBadge,
            {
              top: -Math.round(size * 0.08),
              right: -Math.round(size * 0.05),
              paddingHorizontal: Math.max(2, Math.round(size * 0.04))
            }
          ]}
        >
          <Text style={[styles.crownText, { fontSize: crownFontSize }]}>
            {frame.icon}
          </Text>
        </View>
      )}

      {/* Level Badge Pill at Bottom */}
      {showLevel && (
        <View
          style={[
            styles.levelBadge,
            {
              bottom: levelBadgeBottom,
              paddingHorizontal: Math.max(4, Math.round(size * 0.08)),
              paddingVertical: Math.max(1, Math.round(size * 0.02))
            }
          ]}
        >
          <Text style={[styles.levelText, { fontSize: levelFontSize }]}>
            Lv.{userLevel}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  speakingRing: {
    position: 'absolute',
    opacity: 0.85
  },
  frameRing: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    backgroundColor: '#0E111F'
  },
  avatar: {
    backgroundColor: '#1E2337'
  },
  crownBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8
  },
  crownText: {
    lineHeight: undefined
  },
  levelBadge: {
    position: 'absolute',
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center'
  },
  levelText: {
    color: '#FFD700',
    fontWeight: 'bold'
  }
});
