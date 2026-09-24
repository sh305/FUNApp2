import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { COLORS } from '../constants/theme';

export const BOX_LEVELS = [
  {
    level: 1,
    title: 'Silver Lucky Chest',
    targetPoints: 12000,
    targetLabel: '12,000',
    coins: 1500,
    frameName: 'Neon Cyber Pulse',
    frameIcon: '🌟',
    animationName: 'Supercar Entry Effect',
    animationIcon: '🏎️',
    chestIcon: '🧰'
  },
  {
    level: 2,
    title: 'Gold Treasure Chest',
    targetPoints: 60000,
    targetLabel: '60,000',
    coins: 8000,
    frameName: 'Golden Royal Crown',
    frameIcon: '👑',
    animationName: 'Phoenix Wings Entry',
    animationIcon: '🦅',
    chestIcon: '📦'
  },
  {
    level: 3,
    title: 'Diamond Dragon Vault',
    targetPoints: 200000,
    targetLabel: '200,000 (2 Lakh)',
    coins: 25000,
    frameName: 'Galaxy Overlord',
    frameIcon: '🌌',
    animationName: 'Dragon Flight Entry',
    animationIcon: '🐉',
    chestIcon: '💎'
  },
  {
    level: 4,
    title: 'Celestial Mythic Chest',
    targetPoints: 400000,
    targetLabel: '400,000 (4 Lakh)',
    coins: 60000,
    frameName: 'Diamond Emperor',
    frameIcon: '⚡',
    animationName: 'Spaceship Warp Entry',
    animationIcon: '🛸',
    chestIcon: '🏆'
  },
  {
    level: 5,
    title: 'Ultimate Godlike Vault',
    targetPoints: 800000,
    targetLabel: '800,000 (8 Lakh)',
    coins: 150000,
    frameName: 'Mythic Godlike Frame',
    frameIcon: '🔥',
    animationName: 'God of Thunder Entry',
    animationIcon: '⚡',
    chestIcon: '👑'
  }
];

export const RoomBoxModal = ({
  visible,
  onClose,
  boxPoints = 0,
  currentLevel = 1,
  onClaimBox,
  claiming = false
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [selectedLevel, setSelectedLevel] = useState(currentLevel || 1);

  const activeLevelData = BOX_LEVELS.find(b => b.level === selectedLevel) || BOX_LEVELS[0];
  const targetPoints = activeLevelData.targetPoints;
  const progressRatio = Math.min(1, Math.max(0, boxPoints / targetPoints));
  const progressPercent = Math.floor(progressRatio * 100);
  const canClaim = boxPoints >= targetPoints && currentLevel <= selectedLevel;
  const isAlreadyClaimed = currentLevel > selectedLevel;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { maxWidth: Math.min(windowWidth - 24, 460) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitleIcon}>🧰</Text>
              <View>
                <Text style={styles.headerTitle}>Lucky Room Box</Text>
                <Text style={styles.headerSubtitle}>5 Levels of Epic Rewards</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current Points Pill */}
          <View style={styles.pointsPill}>
            <Text style={styles.pointsLabel}>Room Box Energy:</Text>
            <Text style={styles.pointsValue}>🔥 {boxPoints.toLocaleString()} Points</Text>
          </View>

          {/* 5-Level Horizontal Selector */}
          <View style={styles.tierTabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tierTabs}>
              {BOX_LEVELS.map(box => {
                const isSelected = box.level === selectedLevel;
                const isCompleted = currentLevel > box.level;
                const isReady = boxPoints >= box.targetPoints && !isCompleted;

                return (
                  <TouchableOpacity
                    key={`box_tab_${box.level}`}
                    style={[
                      styles.tierTab,
                      isSelected && styles.tierTabSelected,
                      isReady && styles.tierTabReady
                    ]}
                    onPress={() => setSelectedLevel(box.level)}
                  >
                    <View style={styles.tierTabChestIconWrapper}>
                      <Text style={styles.tierTabChestIcon}>{box.chestIcon}</Text>
                      {isCompleted && (
                        <View style={styles.checkBadge}>
                          <Text style={styles.checkBadgeText}>✓</Text>
                        </View>
                      )}
                      {isReady && (
                        <View style={styles.readyBadge}>
                          <Text style={styles.readyBadgeText}>CLAIM</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tierTabLevel, isSelected && styles.tierTabLevelSelected]}>
                      Lv.{box.level}
                    </Text>
                    <Text style={styles.tierTabPoints}>{box.targetLabel.split(' ')[0]}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Active Box Card */}
          <View style={styles.activeBoxCard}>
            <View style={styles.activeBoxHeader}>
              <View style={styles.chestBigWrapper}>
                <Text style={styles.chestBigIcon}>{activeLevelData.chestIcon}</Text>
                <View style={styles.chestGlow} />
              </View>
              <View style={styles.activeBoxTitleCol}>
                <Text style={styles.activeBoxLevelBadge}>LEVEL {activeLevelData.level} BOX</Text>
                <Text style={styles.activeBoxTitle}>{activeLevelData.title}</Text>
                <Text style={styles.activeBoxPointsReq}>
                  Goal: {activeLevelData.targetLabel} Points
                </Text>
              </View>
            </View>

            {/* Live Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` }
                  ]}
                />
              </View>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressNumbers}>
                  {boxPoints.toLocaleString()} / {targetPoints.toLocaleString()}
                </Text>
                <Text style={styles.progressPercentText}>{progressPercent}%</Text>
              </View>
            </View>

            {/* Rewards Included */}
            <View style={styles.rewardsBox}>
              <Text style={styles.rewardsTitle}>🎁 UNLOCK REWARDS:</Text>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>🪙</Text>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>+{activeLevelData.coins.toLocaleString()} YoYo Coins</Text>
                  <Text style={styles.rewardDesc}>Added directly to your balance</Text>
                </View>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>{activeLevelData.frameIcon}</Text>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{activeLevelData.frameName}</Text>
                  <Text style={styles.rewardDesc}>Exclusive animated room frame</Text>
                </View>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>{activeLevelData.animationIcon}</Text>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{activeLevelData.animationName}</Text>
                  <Text style={styles.rewardDesc}>Special entrance show-off animation</Text>
                </View>
              </View>
            </View>

            {/* Action Claim Button */}
            {isAlreadyClaimed ? (
              <View style={styles.claimedPill}>
                <Text style={styles.claimedText}>✓ ALREADY OPENED</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.claimBtn,
                  !canClaim && styles.claimBtnDisabled
                ]}
                disabled={!canClaim || claiming}
                onPress={() => onClaimBox(activeLevelData.level)}
              >
                {claiming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.claimBtnText}>
                      {canClaim ? '🎉 OPEN BOX NOW!' : `Need ${(targetPoints - boxPoints).toLocaleString()} More Points`}
                    </Text>
                    {!canClaim && (
                      <Text style={styles.claimBtnSubText}>Send gifts in room to boost energy 🚀</Text>
                    )}
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 6, 25, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1b123a',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    padding: 16,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerTitleIcon: {
    fontSize: 28
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)'
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  pointsPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14
  },
  pointsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600'
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#facc15'
  },
  tierTabsContainer: {
    marginBottom: 14
  },
  tierTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2
  },
  tierTab: {
    width: 66,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  tierTabSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.35)',
    borderColor: '#c084fc',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4
  },
  tierTabReady: {
    borderColor: '#facc15',
    backgroundColor: 'rgba(250, 204, 21, 0.15)'
  },
  tierTabChestIconWrapper: {
    position: 'relative'
  },
  tierTabChestIcon: {
    fontSize: 22
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#22c55e',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900'
  },
  readyBadge: {
    position: 'absolute',
    top: -6,
    right: -14,
    backgroundColor: '#facc15',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4
  },
  readyBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900'
  },
  tierTabLevel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4
  },
  tierTabLevelSelected: {
    color: '#ffffff'
  },
  tierTabPoints: {
    fontSize: 9,
    color: '#a855f7',
    fontWeight: '600',
    marginTop: 1
  },
  activeBoxCard: {
    backgroundColor: 'rgba(30, 20, 60, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14
  },
  activeBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  chestBigWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderWidth: 1.5,
    borderColor: '#c084fc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  chestBigIcon: {
    fontSize: 32
  },
  chestGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(192, 132, 252, 0.2)'
  },
  activeBoxTitleCol: {
    flex: 1
  },
  activeBoxLevelBadge: {
    fontSize: 10,
    color: '#c084fc',
    fontWeight: '800',
    letterSpacing: 0.8
  },
  activeBoxTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2
  },
  activeBoxPointsReq: {
    fontSize: 12,
    color: '#facc15',
    fontWeight: '600',
    marginTop: 2
  },
  progressContainer: {
    marginBottom: 14
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#06b6d4'
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  progressNumbers: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)'
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06b6d4'
  },
  rewardsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    gap: 8
  },
  rewardsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  rewardIcon: {
    fontSize: 20
  },
  rewardInfo: {
    flex: 1
  },
  rewardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  rewardDesc: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)'
  },
  claimedPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center'
  },
  claimedText: {
    color: '#22c55e',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5
  },
  claimBtn: {
    backgroundColor: '#9333ea',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c084fc',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6
  },
  claimBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
    elevation: 0
  },
  claimBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  claimBtnSubText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2
  }
});
