import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  RefreshControl
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { roomApi } from '../api/roomApi';
import { RoomCard } from '../components/RoomCard';
import { AvatarWithFrame } from '../components/AvatarWithFrame';
import { LockRoomModal } from '../components/LockRoomModal';

export const HomeScreen = ({ onOpenRoom, onOpenProfile }) => {
  const { user, token, refreshProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Password verify modal for locked room
  const [selectedLockedRoom, setSelectedLockedRoom] = useState(null);
  const [lockModalVisible, setLockModalVisible] = useState(false);

  // Create room modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Chat');
  const [isLockedNew, setIsLockedNew] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const categories = ['All', 'Music', 'Chat', 'Gaming', 'Dating'];

  useEffect(() => {
    loadRooms();
  }, [category]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomApi.getRooms(category);
      setRooms(data);
    } catch (err) {
      console.warn('Failed to load rooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRoomPress = (room) => {
    // If room is locked and user is not owner, prompt password
    if (room.isLocked && room.ownerId !== user?.id) {
      setSelectedLockedRoom(room);
      setLockModalVisible(true);
    } else {
      onOpenRoom(room.id);
    }
  };

  const handleVerifyPassword = async (enteredPassword) => {
    if (!selectedLockedRoom) return;
    await roomApi.verifyPassword(selectedLockedRoom.id, enteredPassword);
    setLockModalVisible(false);
    onOpenRoom(selectedLockedRoom.id, enteredPassword);
  };

  const handleCreateRoom = async () => {
    if (!newTitle.trim()) {
      setCreateError('Room ka title enter karein.');
      return;
    }
    if (isLockedNew && !newPassword.trim()) {
      setCreateError('Lock karne ke liye password zaroori hai.');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError('');
      const res = await roomApi.createRoom(token, {
        title: newTitle.trim(),
        category: newCategory,
        isLocked: isLockedNew,
        password: isLockedNew ? newPassword.trim() : null
      });

      setCreateModalVisible(false);
      setNewTitle('');
      setNewPassword('');
      setIsLockedNew(false);
      loadRooms();
      onOpenRoom(res.roomId);
    } catch (err) {
      setCreateError(err.message || 'Room creation failed');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>🎙️ YoYo</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Wallet Coins Chip */}
          <View style={styles.coinsChip}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinCount}>
              {(user?.coins || 0).toLocaleString()}
            </Text>
          </View>

          {/* Profile Avatar with Frame */}
          <TouchableOpacity onPress={onOpenProfile} style={styles.profileBtn}>
            <AvatarWithFrame
              avatarUrl={user?.avatarUrl}
              frameId={user?.activeFrameId || 1}
              userLevel={user?.userLevel || 1}
              size={36}
              showLevel={false}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills Bar */}
      <View style={styles.categoriesBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                category === item && styles.categoryChipActive
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === item && styles.categoryChipTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Room List Feed */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Voice Rooms Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => `room_${item.id}`}
          renderItem={({ item }) => (
            <RoomCard room={item} onPress={handleRoomPress} />
          )}
          contentContainerStyle={styles.roomList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                refreshProfile();
                loadRooms();
              }}
              tintColor={COLORS.gold}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📻</Text>
              <Text style={styles.emptyTitle}>Abhi koi room nahi hai</Text>
              <Text style={styles.emptyDesc}>Naya room banayein aur dosto ko invite karein!</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button: Create Room */}
      <TouchableOpacity
        style={styles.createRoomFab}
        onPress={() => setCreateModalVisible(true)}
      >
        <Text style={styles.fabIcon}>🎙️</Text>
        <Text style={styles.fabText}>Create Room</Text>
      </TouchableOpacity>

      {/* Lock Password Modal for Guest Joining */}
      {selectedLockedRoom && (
        <LockRoomModal
          visible={lockModalVisible}
          onClose={() => setLockModalVisible(false)}
          isCurrentlyLocked={true}
          isOwner={false}
          onVerifyPassword={handleVerifyPassword}
        />
      )}

      {/* Create Room Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✨ Naya Voice Room Banayein</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Room Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Bollywood Karaoke & Chit-Chat 🎵"
              placeholderTextColor={COLORS.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryPickerRow}>
              {['Music', 'Chat', 'Gaming', 'Dating'].map(cat => (
                <TouchableOpacity
                  key={`pick_${cat}`}
                  style={[
                    styles.catPickBtn,
                    newCategory === cat && styles.catPickBtnActive
                  ]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catPickText,
                      newCategory === cat && styles.catPickTextActive
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Lock with Password Toggle */}
            <View style={styles.lockToggleRow}>
              <View>
                <Text style={styles.lockToggleTitle}>Lock with Password</Text>
                <Text style={styles.lockToggleDesc}>
                  Sirf wahi enter kar payenge jinko password pata hoga
                </Text>
              </View>
              <Switch
                value={isLockedNew}
                onValueChange={setIsLockedNew}
                trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                thumbColor={isLockedNew ? COLORS.gold : '#f4f3f4'}
              />
            </View>

            {isLockedNew && (
              <TextInput
                style={styles.modalInput}
                placeholder="Enter 4-digit PIN or Password"
                placeholderTextColor={COLORS.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            )}

            <View style={styles.initialSeatsNotice}>
              <Text style={styles.noticeText}>
                💡 Initial seats: <Text style={styles.noticeBold}>8 Seats</Text>. Room Level 12+ hone par seats automatic badhegi (+2 per 12 multiples)!
              </Text>
            </View>

            {createError ? <Text style={styles.errorText}>{createError}</Text> : null}

            <TouchableOpacity
              style={styles.createSubmitBtn}
              disabled={createLoading}
              onPress={handleCreateRoom}
            >
              {createLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.createSubmitText}>Launch Room 🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.gold,
    letterSpacing: 0.5
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  coinsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gold,
    marginRight: 10
  },
  coinIcon: {
    fontSize: 14,
    marginRight: 4
  },
  coinCount: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold'
  },
  profileBtn: {
    padding: 2
  },
  categoriesBar: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  roomList: {
    padding: 14,
    paddingBottom: 90
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 10
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold'
  },
  emptyDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4
  },
  createRoomFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8
  },
  fabIcon: {
    fontSize: 18,
    marginRight: 6
  },
  fabText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalCloseText: {
    color: COLORS.textSecondary,
    fontSize: 20,
    fontWeight: 'bold'
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8
  },
  modalInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    fontSize: 14,
    marginBottom: 10
  },
  categoryPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  catPickBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  catPickBtnActive: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0, 240, 255, 0.15)'
  },
  catPickText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  catPickTextActive: {
    color: COLORS.secondary,
    fontWeight: 'bold'
  },
  lockToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  lockToggleTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold'
  },
  lockToggleDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  initialSeatsNotice: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryLight
  },
  noticeText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16
  },
  noticeBold: {
    color: COLORS.gold,
    fontWeight: 'bold'
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center'
  },
  createSubmitBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6
  },
  createSubmitText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold'
  }
});
