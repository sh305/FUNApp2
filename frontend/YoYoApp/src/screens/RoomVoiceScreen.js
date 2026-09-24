import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { roomApi } from '../api/roomApi';
import { giftApi } from '../api/giftApi';
import { moderationApi } from '../api/moderationApi';
import { roomHubService } from '../signalr/roomHubService';

import { AvatarWithFrame } from '../components/AvatarWithFrame';
import { MicSeatGrid } from '../components/MicSeatGrid';
import { ChatBox } from '../components/ChatBox';
import { GiftAnimationOverlay } from '../components/GiftAnimationOverlay';
import { SendGiftModal } from '../components/SendGiftModal';
import { LockRoomModal } from '../components/LockRoomModal';
import { KickUserModal } from '../components/KickUserModal';
import { ReportUserModal } from '../components/ReportUserModal';
import { UserProfileModal } from '../components/UserProfileModal';
import { RoomBoxModal, BOX_LEVELS } from '../components/RoomBoxModal';
import { EmojiPickerModal } from '../components/EmojiPickerModal';

export const RoomVoiceScreen = ({ roomId, roomPassword, onLeave }) => {
  const { user, token, updateCoins, refreshProfile } = useAuth();
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatCount, setSeatCount] = useState(8);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Room Box state
  const [boxPoints, setBoxPoints] = useState(0);
  const [currentBoxLevel, setCurrentBoxLevel] = useState(1);
  const [boxModalVisible, setBoxModalVisible] = useState(false);
  const [claimingBox, setClaimingBox] = useState(false);

  // Modals state
  const [activeGiftEvent, setActiveGiftEvent] = useState(null);
  const [sendGiftModalVisible, setSendGiftModalVisible] = useState(false);
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [kickModalVisible, setKickModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [roomToolsVisible, setRoomToolsVisible] = useState(false);
  const [emojiModalVisible, setEmojiModalVisible] = useState(false);

  // Chat inline input state
  const [inlineChatOpen, setInlineChatOpen] = useState(false);
  const [inlineComment, setInlineComment] = useState('');

  const isOwner = room?.ownerId === user?.id;

  useEffect(() => {
    initRoom();
    return () => {
      roomHubService.leaveRoom(roomId).catch(() => {});
      roomHubService.clearListeners();
    };
  }, [roomId]);

  const initRoom = async () => {
    try {
      setLoading(true);
      const data = await roomApi.getRoomById(roomId);
      setRoom(data);
      setSeats(data.seats || []);
      setSeatCount(data.seatCount || 8);
      setBoxPoints(data.boxPoints || 0);
      setCurrentBoxLevel(data.currentBoxLevel || 1);

      // Set up listeners first so no events are missed
      setupSignalRListeners();

      // Connect SignalR and join
      await roomHubService.connect(token);
      await roomHubService.joinRoom(roomId, roomPassword);

      // Welcome notice
      setMessages([
        {
          id: `welcome_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          isSystemNotice: true,
          content: `Welcome to ${data.title}! Please maintain respect and enjoy your stay!`
        }
      ]);
    } catch (err) {
      Alert.alert('Room Error', err.message || 'Room load nahi ho paya.', [
        { text: 'OK', onPress: onLeave }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const setupSignalRListeners = () => {
    // Clear any previous listeners to prevent duplicate executions
    roomHubService.clearListeners();

    // 1. Seat Occupied
    roomHubService.on('SeatOccupied', (data) => {
      setSeats(prev => {
        const next = [...prev];
        const idx = next.findIndex(s => s.seatIndex === data.seatIndex);
        if (idx !== -1) {
          next[idx] = {
            ...next[idx],
            occupantUserId: data.occupant.id,
            occupant: data.occupant
          };
        } else {
          next.push({
            seatIndex: data.seatIndex,
            occupantUserId: data.occupant.id,
            occupant: data.occupant
          });
        }
        return next;
      });

      setMessages(prev => [
        ...prev,
        {
          id: `seat_occ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          isSystemNotice: true,
          content: `${data.occupant.displayName} took Seat No.${data.seatIndex + 1} 🛋️`
        }
      ]);
    });

    // 2. Seat Vacated
    roomHubService.on('SeatVacated', (data) => {
      setSeats(prev => {
        return prev.map(s => {
          if (s.seatIndex === data.seatIndex) {
            return { ...s, occupantUserId: null, occupant: null };
          }
          return s;
        });
      });
    });

    // 3. Dynamic Seat Expansion
    roomHubService.on('SeatCountExpanded', (data) => {
      setSeatCount(data.newSeatCount);
      setRoom(prev => prev ? { ...prev, roomLevel: data.roomLevel, seatCount: data.newSeatCount } : prev);
      
      setMessages(prev => [
        ...prev,
        {
          id: `expand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          isSystemNotice: true,
          content: `🎉 CONGRATULATIONS! Room Level upgraded to Lv.${data.roomLevel}! Capacity expanded to ${data.newSeatCount} seats! 🚀`
        }
      ]);
    });

    // 4. Gift Alert & Box Progress update
    roomHubService.on('ReceiveGiftAlert', (eventData) => {
      setActiveGiftEvent(eventData);
      setRoom(prev => prev ? { ...prev, roomLevel: eventData.newRoomLevel, seatCount: eventData.newSeatCount } : prev);
      if (eventData.newSeatCount > seatCount) {
        setSeatCount(eventData.newSeatCount);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `gift_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          isGiftAlert: true,
          senderName: eventData.senderName,
          giftName: eventData.gift.name,
          receiverName: eventData.receiverName
        }
      ]);

      if (eventData.senderId === user?.id) {
        refreshProfile();
      }
    });

    // 5. Room Box Live Progress
    roomHubService.on('RoomBoxProgressUpdated', (data) => {
      setBoxPoints(data.boxPoints);
      setRoom(prev => prev ? { ...prev, boxPoints: data.boxPoints } : prev);
    });

    // 6. Room Box Claimed Announcement
    roomHubService.on('RoomBoxClaimed', (data) => {
      setCurrentBoxLevel(data.nextLevel);
      setRoom(prev => prev ? { ...prev, currentBoxLevel: data.nextLevel } : prev);
      setMessages(prev => [
        ...prev,
        {
          id: `box_claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          isSystemNotice: true,
          content: `✨ ${data.userDisplayName} opened Lucky Room Box Level ${data.claimedLevel}! 🎉`
        }
      ]);
    });

    // 7. Room Lock Status
    roomHubService.on('RoomLockStatusChanged', (data) => {
      setRoom(prev => prev ? { ...prev, isLocked: data.isLocked } : prev);
      setMessages(prev => [
        ...prev,
        {
          id: `lock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          isSystemNotice: true,
          content: data.isLocked ? '🔒 Room is now locked by owner.' : '🔓 Room is now unlocked.'
        }
      ]);
    });

    // 8. User Kicked
    roomHubService.on('UserKickedBroadcast', (data) => {
      if (data.userId === user?.id) {
        const msg = data.kickType === 'Permanent'
          ? 'Aapko is room se permanently kick/ban kiya gaya hai.'
          : 'Aapko is room se 3 dino ke liye kick kiya gaya hai.';
        Alert.alert('Kicked from Room', msg, [{ text: 'OK', onPress: onLeave }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `kick_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            isSystemNotice: true,
            content: `👢 User kicked from room (${data.kickType === 'Permanent' ? 'Permanent' : '3 Days'}).`
          }
        ]);
      }
    });

    // 9. Incoming Chat Messages
    roomHubService.on('ReceiveChatMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // 10. Notices
    roomHubService.on('UserBannedNotice', (msg) => {
      Alert.alert('Account Banned', msg, [{ text: 'OK', onPress: onLeave }]);
    });

    roomHubService.on('RoomKickNotice', (msg) => {
      Alert.alert('Room Ban', msg, [{ text: 'OK', onPress: onLeave }]);
    });

    roomHubService.on('ErrorNotice', (msg) => {
      Alert.alert('Notice', msg);
    });
  };

  const handleTakeSeat = async (seatIndex) => {
    try {
      await roomHubService.takeSeat(roomId, seatIndex);
    } catch (err) {
      Alert.alert('Error', err.message || 'Seat occupy nahi ho payi.');
    }
  };

  const handleLeaveSeat = async (seatIndex) => {
    try {
      await roomHubService.leaveSeat(roomId, seatIndex);
    } catch (err) {
      Alert.alert('Error', err.message || 'Seat vacate nahi ho payi.');
    }
  };

  const handleToggleRoomLock = async (isLocked, password) => {
    if (isLocked) {
      await roomApi.lockRoom(token, roomId, password);
    } else {
      await roomApi.unlockRoom(token, roomId);
    }
    await roomHubService.toggleLock(roomId, isLocked, password);
    setRoom(prev => prev ? { ...prev, isLocked } : prev);
  };

  const handleConfirmKick = async (targetUserId, kickType) => {
    await roomHubService.kickUser(roomId, targetUserId, kickType);
    Alert.alert('Success', `User ko ${kickType === 'Permanent' ? 'Permanently' : '3 dino ke liye'} kick kar diya gaya.`);
  };

  const handleSubmitReport = async ({ reportedUserId, reason, durationType }) => {
    await moderationApi.reportUser(token, { reportedUserId, reason, durationType });
    Alert.alert('Report Submitted', `Report submit ho gaya hai aur user per ${durationType} ban laga diya gaya.`);
  };

  const handleSendGift = async ({ receiverUserId, giftId, quantity }) => {
    const res = await giftApi.sendGift(token, {
      roomId,
      receiverUserId,
      giftId,
      quantity
    });
    const giftCoins = res.eventData?.totalCoins || 0;
    updateCoins(-giftCoins);
    // Locally add box points
    setBoxPoints(prev => prev + giftCoins);
  };

  const handleSendMessage = async (text) => {
    if (!text?.trim()) return;
    await roomHubService.sendMessage(roomId, text.trim());
    setInlineComment('');
    setInlineChatOpen(false);
  };

  const handleClaimBox = async (level) => {
    try {
      setClaimingBox(true);
      const res = await roomApi.claimBox(token, roomId);
      if (res.success) {
        updateCoins(res.coinsAwarded || 0);
        setCurrentBoxLevel(res.nextLevel || level + 1);
        await refreshProfile();
        Alert.alert(
          '🎉 BOX UNLOCKED!',
          `Badhai ho! Level ${level} Lucky Box open ho gaya!\n\n🪙 +${res.coinsAwarded?.toLocaleString()} Coins\n👑 Exclusive Frame Added\n🏎️ Special Entry Animation Unlocked!`,
          [{ text: 'AWESOME!', onPress: () => setBoxModalVisible(false) }]
        );
      }
    } catch (err) {
      Alert.alert('Claim Error', err.message || 'Box claim karne me problem aayi');
    } finally {
      setClaimingBox(false);
    }
  };

  if (loading || !room) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>Connecting to YoYo Voice Room...</Text>
      </View>
    );
  }

  // Active occupants list for gift picker
  const activeRecipients = [
    { id: room.ownerId, displayName: `${room.owner?.displayName || 'Host'} (Owner)` },
    ...seats
      .filter(s => s.occupantUserId && s.occupant && s.occupantUserId !== room.ownerId)
      .map(s => ({
        id: s.occupantUserId,
        displayName: s.occupant.displayName,
        seatIndex: s.seatIndex
      }))
  ];

  // Active level target calculation for top-left mini progress bar
  const currentBoxTarget = BOX_LEVELS.find(b => b.level === currentBoxLevel)?.targetPoints || 12000;
  const boxProgressRatio = Math.min(1, Math.max(0, boxPoints / currentBoxTarget));
  const isUserOnMic = seats.some(s => s.occupantUserId === user?.id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Full-screen Broadcast Gift Alert */}
        <GiftAnimationOverlay
          eventData={activeGiftEvent}
          onDismiss={() => setActiveGiftEvent(null)}
        />

        {/* TOP HEADER */}
        <View style={styles.header}>
          {/* Left Room Card Pill */}
          <View style={styles.headerLeftPill}>
            <View style={styles.roomLevelDiamond}>
              <Text style={styles.roomLevelDiamondText}>{room.roomLevel || 1}</Text>
            </View>
            <View style={styles.roomNameCol}>
              <Text style={styles.roomTitleText} numberOfLines={1}>
                {room.title || 'YoYo Lounge'}
              </Text>
              <Text style={styles.roomIdText}>
                ID:{room.roomNumber || '9575189'} 👥 {seats.filter(s => s.occupantUserId).length + 1}
              </Text>
            </View>
            {isOwner && (
              <TouchableOpacity
                style={styles.headerLockBtn}
                onPress={() => setLockModalVisible(true)}
              >
                <Text style={styles.headerLockIcon}>{room.isLocked ? '🔒' : '🔓'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Right Action Icons (Trophy, Close) */}
          <View style={styles.headerRightActions}>
            <View style={styles.trophyBadge}>
              <Text style={styles.trophyIcon}>🏆</Text>
              <Text style={styles.trophyCount}>0</Text>
            </View>

            <TouchableOpacity style={styles.headerCloseBtn} onPress={onLeave}>
              <Text style={styles.headerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* COSMIC BACKGROUND DECORATION WITH YOYO WATERMARK & STARS */}
        <View style={styles.cosmicBackground}>
          <Text style={styles.starDecor1}>✦</Text>
          <Text style={styles.starDecor2}>★</Text>
          <Text style={styles.starDecor3}>✧</Text>
          <Text style={styles.yoyoWatermark}>YOYO</Text>
        </View>

        {/* UPPER STAGE: TOP-LEFT LUCKY CHEST + TOP-CENTER HOST AVATAR */}
        {/* UPPER STAGE: TOP-LEFT LUCKY CHEST + DEAD-CENTER HOST AVATAR */}
        <View style={styles.upperStageRow}>
          {/* Top-Left 3D Lucky Treasure Box Widget */}
          <View style={styles.upperLeftCol}>
            <TouchableOpacity
              style={styles.luckyBoxWidget}
              activeOpacity={0.8}
              onPress={() => setBoxModalVisible(true)}
            >
              <View style={styles.luckyChestIconWrapper}>
                <Text style={styles.luckyChestIcon}>🧰</Text>
                {boxPoints >= currentBoxTarget && (
                  <View style={styles.boxReadyDot} />
                )}
              </View>
              {/* Cyan Mini Progress Bar */}
              <View style={styles.miniProgressBarTrack}>
                <View
                  style={[
                    styles.miniProgressBarFill,
                    { width: `${Math.floor(boxProgressRatio * 100)}%` }
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Top-Center Host Avatar & Winged Badge */}
          <View style={styles.upperCenterCol}>
            <TouchableOpacity
              style={styles.hostAvatarContainer}
              activeOpacity={0.8}
              onPress={() => {
                if (room.owner) {
                  setSelectedUser(room.owner);
                  setProfileModalVisible(true);
                }
              }}
            >
              <View style={styles.hostAvatarHalo}>
                <AvatarWithFrame
                  avatarUrl={room.owner?.avatarUrl}
                  frameId={room.owner?.activeFrameId || 2}
                  userLevel={room.owner?.userLevel || 9}
                  size={46}
                />
              </View>
              {/* Host Name Badge with Wing Symbols */}
              <View style={styles.hostNamePill}>
                <Text style={styles.hostNameText} numberOfLines={1}>
                  ꧁༒•{room.owner?.displayName || 'Raftar'}😎😎
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Right Spacer for Perfect Host Centering */}
          <View style={styles.upperRightSpacer} />
        </View>

        {/* 8-SEAT MIC STAGE (EXACTLY 4 SEATS PER ROW) */}
        <View style={styles.micStageContainer}>
          <MicSeatGrid
            seats={seats}
            seatCount={seatCount}
            currentUserId={user?.id}
            onTakeSeat={handleTakeSeat}
            onLeaveSeat={handleLeaveSeat}
            onSelectOccupant={(occupant) => {
              setSelectedUser(occupant);
              setProfileModalVisible(true);
            }}
          />
        </View>

        {/* LIVE CHAT BOX WITH PINNED HINDI SAFETY NOTICE */}
        <View style={styles.chatAreaWrapper}>
          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            hideInputBar={true}
          />
        </View>

        {/* INLINE COMMENT POPUP (WHEN "कमेंट लिखिए" IS TAPPED) */}
        {inlineChatOpen && (
          <View style={styles.inlineInputBar}>
            <TextInput
              style={styles.inlineTextInput}
              placeholder="कमेंट लिखिए..."
              placeholderTextColor="#94a3b8"
              value={inlineComment}
              onChangeText={setInlineComment}
              autoFocus
              onSubmitEditing={() => handleSendMessage(inlineComment)}
            />
            <TouchableOpacity
              style={styles.inlineEmojiBtn}
              onPress={() => setEmojiModalVisible(true)}
            >
              <Text style={{ fontSize: 18 }}>😊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inlineSendBtn, !inlineComment.trim() && styles.inlineSendBtnDisabled]}
              disabled={!inlineComment.trim()}
              onPress={() => handleSendMessage(inlineComment)}
            >
              <Text style={styles.inlineSendIcon}>➤</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inlineCancelBtn}
              onPress={() => setInlineChatOpen(false)}
            >
              <Text style={styles.inlineCancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BOTTOM ACTION BAR */}
        <View style={styles.bottomBar}>
          {/* 1. Comment Input Pill */}
          <TouchableOpacity
            style={styles.commentPillBtn}
            onPress={() => setInlineChatOpen(true)}
          >
            <Text style={styles.commentPillText}>कमेंट लिखिए</Text>
          </TouchableOpacity>

          {/* 2. Emoji Button 😊 */}
          <TouchableOpacity
            style={styles.bottomCircleBtn}
            onPress={() => setEmojiModalVisible(true)}
          >
            <Text style={styles.bottomBtnIcon}>😊</Text>
          </TouchableOpacity>

          {/* 3. Mic Toggle Button 🎙️ */}
          <TouchableOpacity
            style={[styles.bottomCircleBtn, isUserOnMic && styles.bottomCircleBtnActive]}
            onPress={() => {
              if (isUserOnMic) {
                const mySeat = seats.find(s => s.occupantUserId === user?.id);
                if (mySeat) handleLeaveSeat(mySeat.seatIndex);
              } else {
                const emptySeat = seats.find(s => !s.occupantUserId);
                if (emptySeat) handleTakeSeat(emptySeat.seatIndex);
                else Alert.alert('Seats Full', 'Sabhi seats filhal occupied hain.');
              }
            }}
          >
            <Text style={styles.bottomBtnIcon}>🎙️</Text>
          </TouchableOpacity>

          {/* 4. Chat 💬 */}
          <TouchableOpacity
            style={styles.bottomCircleBtn}
            onPress={() => setInlineChatOpen(prev => !prev)}
          >
            <Text style={styles.bottomBtnIcon}>💬</Text>
          </TouchableOpacity>

          {/* 5. GLOWING 3D PINK GIFT BOX 🎁 */}
          <TouchableOpacity
            style={styles.glowingGiftBtn}
            activeOpacity={0.85}
            onPress={() => setSendGiftModalVisible(true)}
          >
            <Text style={styles.glowingGiftIcon}>🎁</Text>
            <View style={styles.giftGoldBow} />
          </TouchableOpacity>
        </View>

        {/* FULL PHONE EMOJI PICKER MODAL */}
        <EmojiPickerModal
          visible={emojiModalVisible}
          onClose={() => setEmojiModalVisible(false)}
          onSendEmoji={(emojiText) => {
            if (inlineChatOpen) {
              setInlineComment(prev => (prev ? `${prev} ${emojiText}` : emojiText));
            } else {
              handleSendMessage(emojiText);
            }
          }}
        />

        {/* 5-LEVEL LUCKY ROOM BOX MODAL */}
        <RoomBoxModal
          visible={boxModalVisible}
          onClose={() => setBoxModalVisible(false)}
          boxPoints={boxPoints}
          currentLevel={currentBoxLevel}
          onClaimBox={handleClaimBox}
          claiming={claimingBox}
        />

        {/* SEND GIFT MODAL */}
        <SendGiftModal
          visible={sendGiftModalVisible}
          onClose={() => setSendGiftModalVisible(false)}
          recipients={activeRecipients}
          currentCoins={user?.coins || 0}
          onSendGift={handleSendGift}
        />

        {/* LOCK ROOM MODAL */}
        <LockRoomModal
          visible={lockModalVisible}
          onClose={() => setLockModalVisible(false)}
          isCurrentlyLocked={room.isLocked}
          isOwner={isOwner}
          onToggleLock={handleToggleRoomLock}
          onVerifyPassword={() => {}}
        />

        {/* USER PROFILE MODAL */}
        <UserProfileModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
          targetUser={selectedUser}
          token={token}
          currentUserId={user?.id}
          isRoomOwner={isOwner}
          onOpenSendGift={(target) => {
            setSelectedUser(target);
            setSendGiftModalVisible(true);
          }}
          onOpenKick={(target) => {
            setSelectedUser(target);
            setKickModalVisible(true);
          }}
          onOpenReport={(target) => {
            setSelectedUser(target);
            setReportModalVisible(true);
          }}
        />

        {/* KICK USER MODAL */}
        <KickUserModal
          visible={kickModalVisible}
          onClose={() => setKickModalVisible(false)}
          targetUser={selectedUser}
          onConfirmKick={handleConfirmKick}
        />

        {/* REPORT USER MODAL */}
        <ReportUserModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
          targetUser={selectedUser}
          onSubmitReport={handleSubmitReport}
        />

        {/* ROOM TOOLS MODAL (TRIGGERED BY 🎛️) */}
        <Modal visible={roomToolsVisible} transparent animationType="fade" onRequestClose={() => setRoomToolsVisible(false)}>
          <View style={styles.toolsModalOverlay}>
            <View style={styles.toolsModalCard}>
              <View style={styles.toolsModalHeader}>
                <Text style={styles.toolsModalTitle}>Room Management</Text>
                <TouchableOpacity onPress={() => setRoomToolsVisible(false)}>
                  <Text style={styles.toolsModalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {isOwner && (
                <TouchableOpacity
                  style={styles.toolItem}
                  onPress={() => {
                    setRoomToolsVisible(false);
                    setLockModalVisible(true);
                  }}
                >
                  <Text style={styles.toolItemIcon}>{room.isLocked ? '🔒' : '🔓'}</Text>
                  <View style={styles.toolItemInfo}>
                    <Text style={styles.toolItemTitle}>Room Password Lock</Text>
                    <Text style={styles.toolItemDesc}>
                      {room.isLocked ? 'Room is Locked (Tap to Unlock)' : 'Set password to keep room private'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.toolItem}
                onPress={() => {
                  setRoomToolsVisible(false);
                  setBoxModalVisible(true);
                }}
              >
                <Text style={styles.toolItemIcon}>🧰</Text>
                <View style={styles.toolItemInfo}>
                  <Text style={styles.toolItemTitle}>Lucky Room Box (5 Levels)</Text>
                  <Text style={styles.toolItemDesc}>Open boxes at 12K, 60K, 2L, 4L, 8L points</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolItem}
                onPress={() => {
                  setRoomToolsVisible(false);
                  Alert.alert('Room Info', `Room: ${room.title}\nID: ${room.roomNumber}\nLevel: ${room.roomLevel}\nSeat Capacity: ${seatCount} Seats`);
                }}
              >
                <Text style={styles.toolItemIcon}>ℹ️</Text>
                <View style={styles.toolItemInfo}>
                  <Text style={styles.toolItemTitle}>Room Details</Text>
                  <Text style={styles.toolItemDesc}>View current level and capacity info</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolItem, styles.toolItemDanger]}
                onPress={() => {
                  setRoomToolsVisible(false);
                  onLeave();
                }}
              >
                <Text style={styles.toolItemIcon}>🚪</Text>
                <View style={styles.toolItemInfo}>
                  <Text style={[styles.toolItemTitle, { color: '#f87171' }]}>Leave Room</Text>
                  <Text style={styles.toolItemDesc}>Return to Home Screen</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0826'
  },
  keyboardContainer: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d0826',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: '#a855f7',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600'
  },

  // 1. HEADER MATCHING SCREENSHOT
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 10,
    paddingBottom: 4,
    zIndex: 10
  },
  headerLeftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38, 28, 74, 0.85)',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    gap: 6
  },
  roomLevelDiamond: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#67e8f9'
  },
  roomLevelDiamondText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900'
  },
  roomNameCol: {
    maxWidth: 105
  },
  roomTitleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  roomIdText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 9,
    fontWeight: '600'
  },
  headerLockBtn: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8
  },
  headerLockIcon: {
    fontSize: 11
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  trophyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)'
  },
  trophyIcon: {
    fontSize: 12
  },
  trophyCount: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 3
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerIconText: {
    fontSize: 14,
    color: '#ffffff'
  },
  headerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCloseText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },

  // 2. COSMIC BACKGROUND WATERMARK & STARS
  cosmicBackground: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    opacity: 0.18
  },
  yoyoWatermark: {
    fontSize: 110,
    fontWeight: '900',
    color: '#a855f7',
    transform: [{ rotate: '-25deg' }],
    letterSpacing: 12
  },
  starDecor1: {
    position: 'absolute',
    top: 140,
    left: 30,
    fontSize: 18,
    color: '#38bdf8'
  },
  starDecor2: {
    position: 'absolute',
    bottom: 220,
    right: 35,
    fontSize: 22,
    color: '#c084fc'
  },
  starDecor3: {
    position: 'absolute',
    top: 260,
    left: 45,
    fontSize: 14,
    color: '#facc15'
  },

  // 3. UPPER STAGE ROW (CHEST + HOST + FLOATING BADGES)
  upperStageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 2,
    width: '100%'
  },
  upperLeftCol: {
    width: 65,
    alignItems: 'flex-start'
  },
  upperCenterCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  upperRightSpacer: {
    width: 65
  },
  luckyBoxWidget: {
    alignItems: 'center',
    width: 52
  },
  luckyChestIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative'
  },
  luckyChestIcon: {
    fontSize: 22
  },
  boxReadyDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#facc15',
    borderWidth: 1.5,
    borderColor: '#ffffff'
  },
  miniProgressBarTrack: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 3,
    overflow: 'hidden'
  },
  miniProgressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#06b6d4'
  },

  // Center Host Avatar
  hostAvatarContainer: {
    alignItems: 'center'
  },
  hostAvatarHalo: {
    padding: 2,
    borderRadius: 30,
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderWidth: 1.5,
    borderColor: '#c084fc',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5
  },
  hostNamePill: {
    backgroundColor: 'rgba(18, 12, 38, 0.85)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)'
  },
  hostNameText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800'
  },

  // Right Floating Badges (Floating beside chat above bottom bar)
  floatingBadgesCol: {
    position: 'absolute',
    right: 6,
    bottom: Platform.OS === 'android' ? 82 : 68,
    gap: 6,
    alignItems: 'center',
    zIndex: 20
  },
  timerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    borderWidth: 1.5,
    borderColor: '#f43f5e',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  timerBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900'
  },
  timerBadgeBow: {
    position: 'absolute',
    top: -5,
    right: -3
  },
  timerBowText: {
    fontSize: 10
  },
  partyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderWidth: 1.5,
    borderColor: '#c084fc',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  partyBadgePill: {
    position: 'absolute',
    top: -4,
    backgroundColor: '#e11d48',
    paddingHorizontal: 2,
    borderRadius: 3
  },
  partyBadgePillText: {
    color: '#ffffff',
    fontSize: 6.5,
    fontWeight: '900'
  },
  partyBadgeEmoji: {
    fontSize: 15,
    marginTop: 1
  },
  arcadeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1.5,
    borderColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  arcadeNewRibbon: {
    position: 'absolute',
    top: -4,
    backgroundColor: '#f59e0b',
    borderRadius: 3,
    paddingHorizontal: 2
  },
  arcadeNewRibbonText: {
    color: '#000000',
    fontSize: 6.5,
    fontWeight: '900'
  },
  arcadeIcon: {
    fontSize: 15
  },

  // 4. 8-SEAT MIC STAGE
  micStageContainer: {
    paddingVertical: 2
  },

  // 5. LIVE CHAT AREA
  chatAreaWrapper: {
    flex: 1,
    marginRight: 6,
    marginLeft: 6,
    marginBottom: 2,
    overflow: 'hidden'
  },

  // INLINE INPUT BAR
  inlineInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b123a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.3)'
  },
  inlineTextInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13
  },
  inlineSendBtn: {
    backgroundColor: '#9333ea',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  inlineSendBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  inlineSendIcon: {
    color: '#ffffff',
    fontSize: 14
  },
  inlineCancelBtn: {
    padding: 6,
    marginLeft: 6
  },
  inlineCancelText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: 'bold'
  },
  inlineEmojiBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4
  },

  // 6. BOTTOM ACTION BAR MATCHING SCREENSHOT
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0a0520',
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'android' ? 38 : 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 30
  },
  commentPillBtn: {
    backgroundColor: 'rgba(40, 30, 75, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    minWidth: 76
  },
  commentPillText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '600'
  },
  bottomCircleBtn: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(40, 30, 75, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative'
  },
  bottomCircleBtnActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: '#22c55e'
  },
  bottomBtnIcon: {
    fontSize: 15
  },
  notificationRedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444'
  },
  glowingGiftBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f472b6',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative'
  },
  glowingGiftIcon: {
    fontSize: 20
  },
  giftGoldBow: {
    position: 'absolute',
    top: 2,
    width: 7,
    height: 2,
    backgroundColor: '#facc15',
    borderRadius: 1
  },

  // ROOM TOOLS MODAL
  toolsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  toolsModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1b123a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    padding: 16,
    gap: 10
  },
  toolsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  toolsModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff'
  },
  toolsModalClose: {
    color: '#ffffff',
    fontSize: 16,
    padding: 4
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 12
  },
  toolItemDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  toolItemIcon: {
    fontSize: 22
  },
  toolItemInfo: {
    flex: 1
  },
  toolItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  },
  toolItemDesc: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2
  }
});
