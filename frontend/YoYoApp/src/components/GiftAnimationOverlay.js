import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export const GiftAnimationOverlay = ({ eventData, onDismiss }) => {
  useEffect(() => {
    if (eventData) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [eventData]);

  if (!eventData) return null;

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <View style={styles.bannerBox}>
        {/* Gift Big Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.giftIcon}>{eventData.gift.iconUrl || '🎁'}</Text>
        </View>

        {/* Banner Details */}
        <View style={styles.textContainer}>
          <Text style={styles.senderText} numberOfLines={1}>
            {eventData.senderName}{' '}
            <Text style={styles.actionText}>sent</Text>{' '}
            <Text style={styles.giftNameText}>{eventData.gift.name}</Text>
          </Text>
          <Text style={styles.receiverText} numberOfLines={1}>
            To: <Text style={styles.receiverHighlight}>{eventData.receiverName}</Text>
            {eventData.quantity > 1 ? ` x${eventData.quantity}` : ''}
          </Text>
        </View>

        {/* EXP Badge */}
        <View style={styles.expBadge}>
          <Text style={styles.expText}>+{eventData.totalCoins} EXP</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center'
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 25, 45, 0.95)',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
    width: '100%',
    maxWidth: 420
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    marginRight: 10
  },
  giftIcon: {
    fontSize: 26
  },
  textContainer: {
    flex: 1
  },
  senderText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold'
  },
  actionText: {
    color: COLORS.textSecondary,
    fontWeight: 'normal',
    fontSize: 12
  },
  giftNameText: {
    color: COLORS.accent,
    fontWeight: 'bold'
  },
  receiverText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  receiverHighlight: {
    color: COLORS.secondary,
    fontWeight: 'bold'
  },
  expBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 6
  },
  expText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold'
  }
});
