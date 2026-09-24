import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { AvatarWithFrame } from '../components/AvatarWithFrame';
import { FRAMES } from '../constants/frames';

export const ProfileScreen = ({ onBack, onOpenBlockedList }) => {
  const { user, token, refreshProfile, logout } = useAuth();
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [equipLoading, setEquipLoading] = useState(false);

  useEffect(() => {
    loadFrames();
  }, []);

  const loadFrames = async () => {
    try {
      setLoading(true);
      const data = await userApi.getFrames(token);
      setFrames(data.filter(f => f.frameType === 'UserLevel'));
    } catch (err) {
      console.warn('Frames load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFrame = async (frameId) => {
    try {
      setEquipLoading(true);
      await userApi.selectFrame(token, frameId);
      await refreshProfile();
      Alert.alert('Success', 'Avatar Frame successfully equip ho gaya!');
    } catch (err) {
      Alert.alert('Frame Locked', err.message || 'Frame equip nahi ho paya.');
    } finally {
      setEquipLoading(false);
    }
  };

  const nextLevelExp = (user?.userLevel || 1) * 1000;
  const currentExp = user?.userExp || 0;
  const expProgress = Math.min(100, Math.floor(((currentExp % 1000) / 1000) * 100));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>My Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <AvatarWithFrame
          avatarUrl={user?.avatarUrl}
          frameId={user?.activeFrameId || 1}
          userLevel={user?.userLevel || 1}
          size={84}
        />

        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.username}>ID: {user?.username}</Text>

        <View style={styles.providerBadge}>
          <Text style={styles.providerText}>Logged in via {user?.authProvider}</Text>
        </View>

        {/* EXP Progress Bar */}
        <View style={styles.expSection}>
          <View style={styles.expLabelsRow}>
            <Text style={styles.expLevelText}>Level {user?.userLevel || 1}</Text>
            <Text style={styles.expProgressText}>{currentExp} / {nextLevelExp} EXP</Text>
          </View>
          <View style={styles.expBarBg}>
            <View style={[styles.expBarFill, { width: `${expProgress}%` }]} />
          </View>
          <Text style={styles.expTip}>
            💡 Gifts send karne se EXP badhega aur naye luxury frames unlock honge!
          </Text>
        </View>

        {/* Wallet Balances */}
        <View style={styles.walletRow}>
          <View style={styles.walletBox}>
            <Text style={styles.walletIcon}>🪙</Text>
            <View>
              <Text style={styles.walletLabel}>Coins</Text>
              <Text style={styles.walletValueGold}>{(user?.coins || 0).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.walletBox}>
            <Text style={styles.walletIcon}>💎</Text>
            <View>
              <Text style={styles.walletLabel}>Diamonds</Text>
              <Text style={styles.walletValueCyan}>{(user?.diamonds || 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Frame Wardrobe Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👑 Luxury Avatar Frames</Text>
        <Text style={styles.sectionSubtitle}>Level badha kar frames unlock karein</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.gold} />
      ) : (
        <View style={styles.framesGrid}>
          {frames.map(f => {
            const isEquipped = user?.activeFrameId === f.id;
            const isUnlocked = (user?.userLevel || 1) >= f.requiredLevel;

            return (
              <View
                key={`frm_${f.id}`}
                style={[
                  styles.frameCard,
                  isEquipped && styles.frameCardEquipped,
                  !isUnlocked && styles.frameCardLocked
                ]}
              >
                <View
                  style={[
                    styles.framePreviewCircle,
                    { borderColor: f.borderColor, shadowColor: f.borderColor }
                  ]}
                >
                  <Text style={styles.frameIcon}>
                    {FRAMES.find(item => item.id === f.id)?.icon || '👑'}
                  </Text>
                </View>

                <Text style={styles.frameName} numberOfLines={1}>{f.name}</Text>
                <Text style={styles.frameReqText}>
                  {isUnlocked ? 'Unlocked' : `Requires Lv.${f.requiredLevel}`}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.equipBtn,
                    isEquipped && styles.equipBtnActive,
                    !isUnlocked && styles.equipBtnDisabled
                  ]}
                  disabled={!isUnlocked || equipLoading}
                  onPress={() => handleSelectFrame(f.id)}
                >
                  <Text
                    style={[
                      styles.equipBtnText,
                      isEquipped && styles.equipBtnTextActive
                    ]}
                  >
                    {isEquipped ? 'Equipped' : (isUnlocked ? 'Equip' : '🔒 Locked')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Account & Privacy Options */}
      <View style={styles.optionsCard}>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={onOpenBlockedList}
        >
          <Text style={styles.optionIcon}>🚫</Text>
          <View style={styles.optionTextCol}>
            <Text style={styles.optionTitle}>Blocked IDs Management</Text>
            <Text style={styles.optionDesc}>Apne block kiye hue users ko dekhein aur unblock karein</Text>
          </View>
          <Text style={styles.optionChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.optionDivider} />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  backBtn: {
    padding: 6
  },
  backText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold'
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold'
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20
  },
  displayName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12
  },
  username: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 8
  },
  providerBadge: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16
  },
  providerText: {
    color: COLORS.textSecondary,
    fontSize: 11
  },
  expSection: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14
  },
  expLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  expLevelText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold'
  },
  expProgressText: {
    color: COLORS.textSecondary,
    fontSize: 11
  },
  expBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  expBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4
  },
  expTip: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 8,
    lineHeight: 14
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  walletBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  walletIcon: {
    fontSize: 22,
    marginRight: 8
  },
  walletLabel: {
    color: COLORS.textMuted,
    fontSize: 10
  },
  walletValueGold: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: 'bold'
  },
  walletValueCyan: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold'
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold'
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  framesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  frameCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    marginBottom: 12
  },
  frameCardEquipped: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.08)'
  },
  frameCardLocked: {
    opacity: 0.6
  },
  framePreviewCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6
  },
  frameIcon: {
    fontSize: 22
  },
  frameName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  frameReqText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8
  },
  equipBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  equipBtnActive: {
    backgroundColor: COLORS.gold
  },
  equipBtnDisabled: {
    backgroundColor: COLORS.card
  },
  equipBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  equipBtnTextActive: {
    color: '#000'
  },
  optionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 12
  },
  optionTextCol: {
    flex: 1
  },
  optionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold'
  },
  optionDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  optionChevron: {
    color: COLORS.textMuted,
    fontSize: 20
  },
  optionDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 4
  },
  logoutBtn: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: 'bold'
  }
});
