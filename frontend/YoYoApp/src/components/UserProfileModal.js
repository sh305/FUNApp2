import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../constants/theme';
import { AvatarWithFrame } from './AvatarWithFrame';
import { userApi } from '../api/userApi';

export const UserProfileModal = ({
  visible,
  onClose,
  targetUser,
  token,
  currentUserId,
  isRoomOwner,
  onOpenSendGift,
  onOpenKick,
  onOpenReport
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const [profileData, setProfileData] = useState(null);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isAccessBlocked, setIsAccessBlocked] = useState(false);
  const [accessBlockedMsg, setAccessBlockedMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (visible && targetUser && token) {
      loadProfile();
    }
  }, [visible, targetUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setIsAccessBlocked(false);
      setAccessBlockedMsg('');

      const res = await userApi.getUserProfile(token, targetUser.id);
      if (res.isBlocked) {
        setIsAccessBlocked(true);
        setAccessBlockedMsg(res.message);
        setProfileData(null);
      } else {
        setProfileData(res.user);
        setIsBlockedByMe(res.isBlockedByYou);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    try {
      setActionLoading(true);
      if (isBlockedByMe) {
        await userApi.unblockUser(token, targetUser.id);
        setIsBlockedByMe(false);
      } else {
        await userApi.blockUser(token, targetUser.id);
        setIsBlockedByMe(true);
      }
    } catch (err) {
      alert(err.message || 'Block action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (!visible || !targetUser) return null;

  const isSelf = targetUser.id === currentUserId;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <SafeAreaView style={[styles.modalSheet, { maxHeight: Math.min(windowHeight * 0.88, 580) }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          ) : isAccessBlocked ? (
            /* Blocked from viewing profile message */
            <View style={styles.blockedState}>
              <Text style={styles.blockedIcon}>🚫</Text>
              <Text style={styles.blockedTitle}>Profile Access Blocked</Text>
              <Text style={styles.blockedDesc}>{accessBlockedMsg}</Text>
              <TouchableOpacity style={styles.backBtn} onPress={onClose}>
                <Text style={styles.backBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* Avatar with Frame */}
              <View style={styles.avatarRow}>
                <AvatarWithFrame
                  avatarUrl={profileData?.avatarUrl || targetUser.avatarUrl}
                  frameId={profileData?.activeFrameId || targetUser.activeFrameId || 1}
                  userLevel={profileData?.userLevel || targetUser.userLevel || 1}
                  size={70}
                />
              </View>

              <Text style={styles.displayName}>
                {profileData?.displayName || targetUser.displayName}
              </Text>
              <Text style={styles.username}>
                ID: {profileData?.username || targetUser.username}
              </Text>

              {/* Stats Bar */}
              <View style={styles.statsCard}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Level</Text>
                  <Text style={styles.statValue}>
                    Lv.{profileData?.userLevel || 1}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Coins</Text>
                  <Text style={styles.statValueGold}>
                    🪙 {(profileData?.coins || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Diamonds</Text>
                  <Text style={styles.statValueCyan}>
                    💎 {(profileData?.diamonds || 0).toLocaleString()}
                  </Text>
                </View>
              </View>

              {!isSelf && (
                <View style={styles.actionsContainer}>
                  {/* Send Gift Button */}
                  <TouchableOpacity
                    style={styles.primaryActionBtn}
                    onPress={() => {
                      onClose();
                      onOpenSendGift(targetUser);
                    }}
                  >
                    <Text style={styles.btnIcon}>🎁</Text>
                    <Text style={styles.primaryBtnText}>Send Gift</Text>
                  </TouchableOpacity>

                  <View style={styles.subActionsRow}>
                    {/* Block / Unblock Button */}
                    <TouchableOpacity
                      style={[styles.subBtn, isBlockedByMe && styles.subBtnDanger]}
                      disabled={actionLoading}
                      onPress={handleToggleBlock}
                    >
                      <Text style={styles.subBtnText}>
                        {isBlockedByMe ? '🔓 Unblock ID' : '🚫 Block ID'}
                      </Text>
                    </TouchableOpacity>

                    {/* Report User Button */}
                    <TouchableOpacity
                      style={styles.subBtn}
                      onPress={() => {
                        onClose();
                        onOpenReport(targetUser);
                      }}
                    >
                      <Text style={styles.subBtnText}>⚠️ Report</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Kick from room (Owner only) */}
                  {isRoomOwner && (
                    <TouchableOpacity
                      style={styles.kickRoomBtn}
                      onPress={() => {
                        onClose();
                        onOpenKick(targetUser);
                      }}
                    >
                      <Text style={styles.kickBtnText}>👢 Kick from Room (3d / Perm)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: '100%',
    maxWidth: 480
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 10,
    padding: 6
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: 20,
    fontWeight: 'bold'
  },
  centerContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  blockedState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28
  },
  blockedIcon: {
    fontSize: 44,
    marginBottom: 10
  },
  blockedTitle: {
    color: COLORS.danger,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6
  },
  blockedDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 16
  },
  backBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  backBtnText: {
    color: COLORS.text,
    fontWeight: '600'
  },
  content: {
    alignItems: 'center',
    paddingTop: 6
  },
  avatarRow: {
    marginVertical: 6
  },
  displayName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4
  },
  username: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 14
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14
  },
  statCol: {
    alignItems: 'center'
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 2
  },
  statValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold'
  },
  statValueGold: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: 'bold'
  },
  statValueCyan: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: 'bold'
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: COLORS.cardBorder
  },
  actionsContainer: {
    width: '100%',
    paddingBottom: 6
  },
  primaryActionBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    marginBottom: 8
  },
  btnIcon: {
    fontSize: 16,
    marginRight: 6
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold'
  },
  subActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  subBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  subBtnDanger: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  subBtnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600'
  },
  kickRoomBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2
  },
  kickBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: 'bold'
  }
});
