import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { ROOM_FRAMES } from '../constants/frames';

export const RoomCard = ({ room, onPress }) => {
  // Find room frame or default
  const frame = ROOM_FRAMES.find(f => f.id === room.activeFrame?.id) || ROOM_FRAMES[0];
  const frameBorderColor = room.roomLevel >= 12 ? COLORS.gold : (frame ? frame.borderColor : COLORS.cardBorder);

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { borderColor: frameBorderColor, shadowColor: frameBorderColor }
      ]}
      activeOpacity={0.8}
      onPress={() => onPress(room)}
    >
      {/* Cover Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              room.coverUrl ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'
          }}
          style={styles.coverImage}
        />
        <View style={styles.gradientOverlay} />

        {/* Category Pill */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{room.category || 'Chat'}</Text>
        </View>

        {/* Lock Badge */}
        {room.isLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>🔒 Locked</Text>
          </View>
        )}

        {/* Room Level Badge */}
        <View style={styles.roomLevelBadge}>
          <Text style={styles.roomLevelText}>Room Lv.{room.roomLevel}</Text>
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {room.title}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.ownerRow}>
            <Image
              source={{
                uri:
                  room.ownerAvatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
              }}
              style={styles.ownerAvatar}
            />
            <Text style={styles.ownerName} numberOfLines={1}>
              {room.ownerName}
            </Text>
          </View>

          {/* Seat Capacity */}
          <View style={styles.seatsPill}>
            <Text style={styles.seatsText}>
              🎙️ {room.occupiedSeatsCount || 0}/{room.seatCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4
  },
  imageWrapper: {
    height: 110,
    width: '100%',
    position: 'relative'
  },
  coverImage: {
    width: '100%',
    height: '100%'
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 25, 0.35)'
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  categoryText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '700'
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  lockText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  roomLevelBadge: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold
  },
  roomLevelText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: 'bold'
  },
  infoContainer: {
    padding: 12
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  ownerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6
  },
  ownerName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    maxWidth: 140
  },
  seatsPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  seatsText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600'
  }
});
