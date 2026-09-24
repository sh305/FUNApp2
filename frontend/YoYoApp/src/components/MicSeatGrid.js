import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { AvatarWithFrame } from './AvatarWithFrame';

export const MicSeatGrid = ({
  seats = [],
  seatCount = 8,
  currentUserId,
  onTakeSeat,
  onLeaveSeat,
  onSelectOccupant
}) => {
  const { width: windowWidth } = useWindowDimensions();

  // Ensure array has length matching seatCount
  const seatList = Array.from({ length: seatCount }, (_, idx) => {
    const existing = seats.find(s => s.seatIndex === idx);
    return existing || { seatIndex: idx, occupantUserId: null, isLocked: false };
  });

  // Exactly 4 seats per row (Row 1: 0-3, Row 2: 4-7, etc.)
  const rows = [];
  for (let i = 0; i < seatList.length; i += 4) {
    rows.push(seatList.slice(i, i + 4));
  }

  // Responsive circle size based on screen width - compact for perfect fit
  const circleSize = Math.min(46, Math.max(38, Math.floor(windowWidth / 7.8)));
  const avatarSize = Math.min(38, Math.max(30, Math.floor(circleSize * 0.82)));

  return (
    <View style={styles.gridRoot}>
      {rows.map((row, rowIdx) => (
        <View key={`seat_row_${rowIdx}`} style={styles.row}>
          {row.map(seat => {
            const isOccupied = !!seat.occupantUserId && !!seat.occupant;
            const isCurrentUserSeat = seat.occupantUserId === currentUserId;

            return (
              <View key={`seat_cell_${seat.seatIndex}`} style={styles.seatCell}>
                <TouchableOpacity
                  style={styles.touchableArea}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (isOccupied) {
                      if (isCurrentUserSeat) {
                        onLeaveSeat(seat.seatIndex);
                      } else {
                        onSelectOccupant(seat.occupant);
                      }
                    } else {
                      onTakeSeat(seat.seatIndex);
                    }
                  }}
                >
                  {isOccupied ? (
                    <View style={styles.occupiedWrapper}>
                      <AvatarWithFrame
                        avatarUrl={seat.occupant.avatarUrl}
                        frameId={seat.occupant.activeFrameId || (seat.occupant.activeFrame ? seat.occupant.activeFrame.id : 1)}
                        userLevel={seat.occupant.userLevel || 1}
                        size={avatarSize}
                      />
                      <Text
                        style={[styles.occupantName, { maxWidth: circleSize + 22 }]}
                        numberOfLines={1}
                      >
                        {seat.occupant.displayName}
                      </Text>
                      {isCurrentUserSeat ? (
                        <Text style={styles.leaveText}>Leave</Text>
                      ) : (
                        <Text style={styles.seatNumText}>No.{seat.seatIndex + 1}</Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.emptyWrapper}>
                      <View
                        style={[
                          styles.emptyDisc,
                          {
                            width: circleSize,
                            height: circleSize,
                            borderRadius: circleSize / 2
                          }
                        ]}
                      >
                        <Text style={[styles.armchairEmoji, { fontSize: Math.floor(circleSize * 0.44) }]}>
                          🛋️
                        </Text>
                      </View>
                      <Text style={styles.seatNumText}>No.{seat.seatIndex + 1}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridRoot: {
    width: '100%',
    paddingHorizontal: 8,
    marginVertical: 2
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    marginVertical: 2
  },
  seatCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  touchableArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyDisc: {
    backgroundColor: 'rgba(88, 62, 148, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(168, 130, 240, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3
  },
  armchairEmoji: {
    opacity: 0.95
  },
  seatNumText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center'
  },
  occupiedWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  occupantName: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
    textAlign: 'center'
  },
  leaveText: {
    color: '#f87171',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 1
  }
});
