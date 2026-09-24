import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  Alert
} from 'react-native';
import { TreasureChestGraphic } from './TreasureChestGraphic';

export const BOX_LEVELS = [
  {
    level: 1,
    title: 'Emerald Green Chest',
    targetPoints: 12000,
    targetLabel: '12,000',
    color: '#10b981',
    chestEmoji: '🧰',
    pedestalGlow: 'rgba(16, 185, 129, 0.4)',
    giftImage: require('../../assets/box_swan_gift.jpg'),
    frameImage: require('../../assets/box_crystal_frame.jpg'),
    specialItemImage: require('../../assets/box_entry_effect.jpg'),
    specialItemBadge: 'Hi~',
    specialItemBadgeColor: '#d946ef',
    prizes: {
      grandGift: { name: 'Crystal Swan Box', coins: 10000 },
      frame: { name: 'Amethyst Crystal Frame', coins: 10000 },
      specialItem: { name: 'VIP Hi~ Greeting Bubble', coins: 30000 },
      coinPacks: [100, 20, 5]
    }
  },
  {
    level: 2,
    title: 'Cyan Diamond Chest',
    targetPoints: 60000,
    targetLabel: '60,000',
    color: '#06b6d4',
    chestEmoji: '💎',
    pedestalGlow: 'rgba(6, 182, 212, 0.4)',
    giftImage: require('../../assets/box_supercar_gift.jpg'),
    frameImage: require('../../assets/box_cyber_frame.jpg'),
    specialItemImage: require('../../assets/box_entry_supercar.jpg'),
    specialItemBadge: '🏎️ SPEED CREST',
    specialItemBadgeColor: '#06b6d4',
    prizes: {
      grandGift: { name: 'Cyber Lightning Supercar', coins: 50000 },
      frame: { name: 'Cyan Laser Cyber Frame', coins: 35000 },
      specialItem: { name: 'Supercar Racing Crest', coins: 75000 },
      coinPacks: [500, 100, 25]
    }
  },
  {
    level: 3,
    title: 'Royal Sapphire Chest',
    targetPoints: 200000,
    targetLabel: '200,000',
    color: '#3b82f6',
    chestEmoji: '📦',
    pedestalGlow: 'rgba(59, 130, 246, 0.4)',
    giftImage: require('../../assets/box_phoenix_gift.jpg'),
    frameImage: require('../../assets/box_crystal_frame.jpg'),
    specialItemImage: require('../../assets/box_entry_phoenix.jpg'),
    specialItemBadge: '👑 VIP EMBLEM',
    specialItemBadgeColor: '#f97316',
    prizes: {
      grandGift: { name: 'Cosmic Phoenix Wings', coins: 150000 },
      frame: { name: 'Galaxy Sovereign Frame', coins: 100000 },
      specialItem: { name: 'Royal Phoenix VIP Emblem', coins: 200000 },
      coinPacks: [2000, 500, 100]
    }
  },
  {
    level: 4,
    title: 'Amethyst Imperial Vault',
    targetPoints: 400000,
    targetLabel: '400,000',
    color: '#a855f7',
    chestEmoji: '🏆',
    pedestalGlow: 'rgba(168, 85, 247, 0.4)',
    giftImage: require('../../assets/box_dragon_gift.jpg'),
    frameImage: require('../../assets/box_dragon_frame.jpg'),
    specialItemImage: require('../../assets/box_dragon_gift.jpg'),
    specialItemBadge: '🐉 DRAGON KING',
    specialItemBadgeColor: '#eab308',
    prizes: {
      grandGift: { name: 'Imperial Dragon Castle', coins: 350000 },
      frame: { name: 'Golden Fire Dragon Frame', coins: 250000 },
      specialItem: { name: 'Golden Dragon King Medallion', coins: 400000 },
      coinPacks: [5000, 1500, 500]
    }
  },
  {
    level: 5,
    title: 'Winged Godlike Sun Vault',
    targetPoints: 800000,
    targetLabel: '800,000',
    color: '#f59e0b',
    chestEmoji: '👑',
    pedestalGlow: 'rgba(245, 158, 11, 0.5)',
    giftImage: require('../../assets/box_godlike_gift.jpg'),
    frameImage: require('../../assets/box_sun_frame.jpg'),
    specialItemImage: require('../../assets/box_godlike_gift.jpg'),
    specialItemBadge: '🏰 SUN PALACE',
    specialItemBadgeColor: '#fbbf24',
    prizes: {
      grandGift: { name: 'Celestial Sun Palace Throne', coins: 1000000 },
      frame: { name: 'Solar God Radiant Crown Frame', coins: 600000 },
      specialItem: { name: 'Celestial Sun Palace Room Theme', coins: 1000000 },
      coinPacks: [20000, 5000, 1000]
    }
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

  // Sequential Progress Logic
  const isPastLevel = currentLevel > selectedLevel;
  const isCurrentActiveLevel = currentLevel === selectedLevel;
  const isFutureLevel = selectedLevel > currentLevel;

  // Future levels are at 0 points; past levels are 100% done; current level uses live points
  const displayPoints = isPastLevel
    ? targetPoints
    : isCurrentActiveLevel
      ? Math.min(boxPoints, targetPoints)
      : 0;

  const progressRatio = targetPoints > 0 ? displayPoints / targetPoints : 0;
  const progressPercent = Math.floor(progressRatio * 100);
  const canClaim = isCurrentActiveLevel && boxPoints >= targetPoints;
  const isAlreadyClaimed = isPastLevel;

  const handleHelpPress = () => {
    Alert.alert(
      'Treasure Box Rules',
      '• Send gifts in the voice room to accumulate energy points.\n• Lv1: Crystal Swan Gift\n• Lv2: Cyber Lightning Supercar\n• Lv3: Cosmic Phoenix Wings\n• Lv4: Imperial Dragon Palace Castle\n• Lv5: Celestial Sun God Palace\n• Resets every day at 1:00 AM midnight.',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.sheetContainer, { maxWidth: Math.min(windowWidth, 480) }]}
          onPress={e => e.stopPropagation()}
        >
          {/* Top Title & Help Icon */}
          <View style={styles.headerRow}>
            <View style={{ width: 28 }} />
            <Text style={styles.headerTitle}>Send gifts to open the treasure box!</Text>
            <TouchableOpacity
              style={styles.helpBtn}
              onPress={handleHelpPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.helpBtnText}>?</Text>
            </TouchableOpacity>
          </View>

          {/* 5-Level Horizontal Progression Line */}
          <View style={styles.levelChainContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.levelChainScroll}
            >
              {BOX_LEVELS.map((box, index) => {
                const isSelected = box.level === selectedLevel;
                const isDone = currentLevel > box.level;

                return (
                  <React.Fragment key={`tier_box_${box.level}`}>
                    <TouchableOpacity
                      style={styles.tierNode}
                      activeOpacity={0.8}
                      onPress={() => setSelectedLevel(box.level)}
                    >
                      {/* Glow Platform under selected chest */}
                      {isSelected ? (
                        <View style={styles.spotlightWrapper}>
                          <View style={styles.spotlightCone} />
                          <View style={styles.spotlightDisc} />
                        </View>
                      ) : (
                        <View style={styles.spotlightPlaceholder} />
                      )}

                      {/* 3D Custom Treasure Chest representation */}
                      <View style={[styles.chestContainer, isSelected && styles.chestContainerSelected]}>
                        <TreasureChestGraphic
                          level={box.level}
                          isSelected={isSelected}
                          size={isSelected ? 44 : 38}
                        />
                        {isDone && (
                          <View style={styles.doneCheck}>
                            <Text style={styles.doneCheckText}>✓</Text>
                          </View>
                        )}
                        {!isDone && box.level > currentLevel && (
                          <View style={styles.lockBadge}>
                            <Text style={styles.lockBadgeText}>🔒</Text>
                          </View>
                        )}
                      </View>

                      {/* Hexagonal Lv Badge */}
                      <View style={[styles.levelHexBadge, isSelected && styles.levelHexBadgeActive]}>
                        <Text style={[styles.levelHexText, isSelected && styles.levelHexTextActive]}>
                          Lv{box.level}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Arrow between tiers */}
                    {index < BOX_LEVELS.length - 1 && (
                      <View style={styles.chainArrow}>
                        <Text style={styles.chainArrowText}>➔</Text>
                      </View>
                    )}
                  </React.Fragment>
                );
              })}
            </ScrollView>
          </View>

          {/* Key Slider Progress Bar */}
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressTrackCapsule}>
              {/* Animated Progress Fill (Only when progress > 0) */}
              {progressPercent > 0 && (
                <View
                  style={[
                    styles.progressFillGradient,
                    { width: `${progressPercent}%` }
                  ]}
                />
              )}
              {/* Golden Key Head */}
              <View
                style={[
                  styles.keyIconWrapper,
                  { left: progressPercent > 0 ? `${Math.min(progressPercent - 3, 90)}%` : -12 }
                ]}
              >
                <Text style={styles.keyEmoji}>🔑</Text>
              </View>
            </View>

            {/* Points Fraction Underneath */}
            <Text style={styles.pointsFractionText}>
              {isPastLevel
                ? `✓ Level ${activeLevelData.level} Completed (${targetPoints.toLocaleString()} / ${targetPoints.toLocaleString()})`
                : isFutureLevel
                  ? `🔒 Locked (Complete Lv${currentLevel} first • 0 / ${targetPoints.toLocaleString()})`
                  : `${displayPoints.toLocaleString()} / ${targetPoints.toLocaleString()}`}
            </Text>
          </View>

          {/* Prize Section Header */}
          <View style={styles.prizeHeaderRow}>
            <Text style={styles.prizeSectionTitle}>
              Prize <Text style={styles.prizeTierHighlight}>({activeLevelData.title})</Text>
            </Text>
          </View>

          {/* Prize Grid Matching Exact Screenshot Layout */}
          <View style={styles.prizeGrid}>
            {/* Left Big Card: Grand Level-Specific Gift */}
            <View style={styles.grandPrizeCard}>
              <Image
                source={activeLevelData.giftImage}
                style={styles.grandPrizeImg}
                resizeMode="cover"
              />
              <View style={styles.pricePill}>
                <View style={styles.yellowDot} />
                <Text style={styles.pricePillText}>
                  {activeLevelData.prizes.grandGift.coins.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Right Column: 2 Rows */}
            <View style={styles.rightPrizeCol}>
              {/* Row 1: Level-Specific Frame & VIP Entry Banner */}
              <View style={styles.rightPrizeRow}>
                {/* Frame Card */}
                <View style={styles.smallPrizeCard}>
                  <Image
                    source={activeLevelData.frameImage}
                    style={styles.smallPrizeImg}
                    resizeMode="cover"
                  />
                  <View style={styles.pricePill}>
                    <View style={styles.yellowDot} />
                    <Text style={styles.pricePillText}>
                      {activeLevelData.prizes.frame.coins.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Unique Special Reward Card (Level 1: Hi~, Level 2: Supercar, Level 3: VIP Emblem, Level 4: Dragon Medallion, Level 5: Sun Palace) */}
                <View style={styles.smallPrizeCard}>
                  <View style={styles.entryImgWrapper}>
                    <Image
                      source={activeLevelData.specialItemImage}
                      style={styles.smallPrizeImg}
                      resizeMode="cover"
                    />
                    <View style={[styles.entryBadgePill, { backgroundColor: activeLevelData.specialItemBadgeColor || '#9333ea' }]}>
                      <Text style={styles.entryBadgePillText}>{activeLevelData.specialItemBadge || 'VIP'}</Text>
                    </View>
                  </View>
                  <View style={styles.pricePill}>
                    <View style={styles.yellowDot} />
                    <Text style={styles.pricePillText}>
                      {activeLevelData.prizes.specialItem.coins.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Row 2: Gold Coin Stacks (Big, Medium, Small) */}
              <View style={styles.rightPrizeRow}>
                {activeLevelData.prizes.coinPacks.map((amount, idx) => (
                  <View key={`coin_pack_${idx}`} style={styles.coinPrizeCard}>
                    <Image
                      source={require('../../assets/box_gold_coins.jpg')}
                      style={[
                        styles.coinStackImg,
                        idx === 1 && { transform: [{ scale: 0.9 }] },
                        idx === 2 && { transform: [{ scale: 0.8 }] }
                      ]}
                      resizeMode="contain"
                    />
                    <View style={styles.pricePill}>
                      <View style={styles.yellowDot} />
                      <Text style={styles.pricePillText}>{amount.toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Bottom Claim Action or Info Notice */}
          {canClaim ? (
            <TouchableOpacity
              style={styles.claimPrizeBtn}
              activeOpacity={0.85}
              disabled={claiming}
              onPress={() => onClaimBox(activeLevelData.level)}
            >
              {claiming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.claimPrizeBtnText}>
                  🎉 CLAIM LV{activeLevelData.level} ({activeLevelData.prizes.grandGift.name}) PRIZES!
                </Text>
              )}
            </TouchableOpacity>
          ) : isAlreadyClaimed ? (
            <View style={styles.alreadyClaimedNotice}>
              <Text style={styles.alreadyClaimedText}>✓ Level {activeLevelData.level} Already Claimed</Text>
            </View>
          ) : (
            <Text style={styles.footerMidnightText}>
              Restart every day at 1:00 a.m midnight.
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#380962',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.2
  },
  helpBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  helpBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  levelChainContainer: {
    marginVertical: 6
  },
  levelChainScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4
  },
  tierNode: {
    alignItems: 'center',
    width: 62,
    position: 'relative'
  },
  spotlightWrapper: {
    position: 'absolute',
    top: 6,
    width: 60,
    height: 44,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1
  },
  spotlightCone: {
    position: 'absolute',
    width: 48,
    height: 38,
    backgroundColor: 'rgba(217, 70, 239, 0.18)',
    borderRadius: 24,
    transform: [{ scaleY: 0.7 }]
  },
  spotlightDisc: {
    width: 54,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(232, 121, 249, 0.65)',
    borderWidth: 1,
    borderColor: '#f0abfc',
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8
  },
  spotlightPlaceholder: {
    height: 14,
    marginBottom: 2
  },
  chestContainer: {
    width: 46,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 2
  },
  chestContainerSelected: {
    transform: [{ scale: 1.1 }]
  },
  chestEmoji: {
    fontSize: 26
  },
  chestEmojiSelected: {
    fontSize: 30
  },
  doneCheck: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#22c55e',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  doneCheckText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900'
  },
  lockBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: 'rgba(15, 6, 40, 0.85)',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  lockBadgeText: {
    fontSize: 8
  },
  levelHexBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    backgroundColor: 'rgba(25, 8, 45, 0.9)',
    alignItems: 'center',
    zIndex: 3
  },
  levelHexBadgeActive: {
    borderColor: '#fbbf24',
    backgroundColor: '#200539',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3
  },
  levelHexText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  levelHexTextActive: {
    color: '#fbbf24'
  },
  chainArrow: {
    marginHorizontal: 3,
    marginBottom: 10
  },
  chainArrowText: {
    fontSize: 14,
    color: 'rgba(192, 132, 252, 0.5)',
    fontWeight: 'bold'
  },
  progressBarWrapper: {
    marginTop: 10,
    marginBottom: 14,
    alignItems: 'center'
  },
  progressTrackCapsule: {
    width: '100%',
    height: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 6, 40, 0.85)',
    borderWidth: 1.5,
    borderColor: '#0284c7',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  progressFillGradient: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6
  },
  keyIconWrapper: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  keyEmoji: {
    fontSize: 22,
    transform: [{ rotate: '-30deg' }]
  },
  pointsFractionText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5
  },
  prizeHeaderRow: {
    marginBottom: 8
  },
  prizeSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3
  },
  prizeTierHighlight: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700'
  },
  prizeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  grandPrizeCard: {
    flex: 1.2,
    height: 156,
    backgroundColor: 'rgba(18, 5, 38, 0.85)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6
  },
  grandPrizeImg: {
    width: '100%',
    height: 114,
    borderRadius: 10
  },
  rightPrizeCol: {
    flex: 2,
    height: 156,
    justifyContent: 'space-between'
  },
  rightPrizeRow: {
    flexDirection: 'row',
    gap: 8,
    height: 74
  },
  smallPrizeCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 5, 38, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  entryImgWrapper: {
    width: '100%',
    height: 44,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden'
  },
  entryBadgePill: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    paddingVertical: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  entryBadgePillText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  smallPrizeImg: {
    width: '100%',
    height: 44,
    borderRadius: 8
  },
  coinPrizeCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 5, 38, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  coinStackImg: {
    width: 38,
    height: 42
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    gap: 4
  },
  yellowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#facc15'
  },
  pricePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff'
  },
  footerMidnightText: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4
  },
  claimPrizeBtn: {
    backgroundColor: '#9333ea',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#c084fc',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 4
  },
  claimPrizeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  alreadyClaimedNotice: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4
  },
  alreadyClaimedText: {
    color: '#22c55e',
    fontWeight: '800',
    fontSize: 12
  }
});
