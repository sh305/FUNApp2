import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  useWindowDimensions
} from 'react-native';

// 8 Distinct Food Items across 4 categories (Veg, Fruit, Fast Food/Bakery, Non-Veg)
export const GREEDY_FOODS = [
  {
    id: 0,
    name: 'Peas & Veg',
    hindiName: 'हरी मटर',
    emoji: '🥦',
    type: 'veg',
    multiplier: 5,
    tag: 'Win 5 times',
    pos: { top: 6, left: 122 }, // Top (12 o'clock)
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.2)'
  },
  {
    id: 1,
    name: 'Kiwi Fruit',
    hindiName: 'गोल्डन कीवी',
    emoji: '🥝',
    type: 'fruit',
    multiplier: 5,
    tag: 'Win 5 times',
    pos: { top: 40, left: 218 }, // Top-Right (1:30)
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.2)'
  },
  {
    id: 2,
    name: 'Fresh Avocado',
    hindiName: 'एवोकाडो',
    emoji: '🥑',
    type: 'veg',
    multiplier: 5,
    tag: 'Win 5 times',
    pos: { top: 124, left: 242 }, // Right (3 o'clock)
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.2)',
    isHot: true
  },
  {
    id: 3,
    name: 'Sweet Tomato',
    hindiName: 'लाल टमाटर',
    emoji: '🍅',
    type: 'veg',
    multiplier: 5,
    tag: 'Win 5 times',
    pos: { top: 208, left: 218 }, // Bottom-Right (4:30)
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.2)'
  },
  {
    id: 4,
    name: 'Swiss Roll Cake',
    hindiName: 'स्विस रोल',
    emoji: '🥐',
    type: 'bakery',
    multiplier: 10,
    tag: 'Win 10 times',
    pos: { top: 242, left: 122 }, // Bottom (6 o'clock)
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.2)'
  },
  {
    id: 5,
    name: 'Crispy Hotdog',
    hindiName: 'हॉटडॉग बर्गर',
    emoji: '🌭',
    type: 'fastfood',
    multiplier: 15,
    tag: 'Win 15 times',
    pos: { top: 208, left: 26 }, // Bottom-Left (7:30)
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.2)'
  },
  {
    id: 6,
    name: 'Pizza Slice',
    hindiName: 'पिज्जा स्लाइस',
    emoji: '🍕',
    type: 'fastfood',
    multiplier: 25,
    tag: 'Win 25 times',
    pos: { top: 124, left: 2 }, // Left (9 o'clock)
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.2)'
  },
  {
    id: 7,
    name: 'Roast Chicken',
    hindiName: 'रोस्ट चिकन',
    emoji: '🍗',
    type: 'nonveg',
    multiplier: 45,
    tag: 'Win 45 times',
    pos: { top: 40, left: 26 }, // Top-Left (10:30)
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.25)',
    isGrand: true
  }
];

const CHIP_VALUES = [10, 50, 100, 1000, 10000];

export const GreedyBabyGameModal = ({
  visible,
  onClose,
  userCoins = 0,
  onUpdateCoins
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [selectedChip, setSelectedChip] = useState(10);
  const [bets, setBets] = useState({}); // { [foodId]: amount }
  const [gameState, setGameState] = useState('betting'); // 'betting' | 'spinning' | 'result'
  const [countdown, setCountdown] = useState(10);
  const [activeIndex, setActiveIndex] = useState(null); // Fast highlight index 0..7
  const [winningFood, setWinningFood] = useState(null);
  const [history, setHistory] = useState([2, 5, 0, 1, 6, 7, 2, 4]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [winModalData, setWinModalData] = useState(null);
  const [rulesVisible, setRulesVisible] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const wheelSpinRef = useRef(null);

  // Mascot Pulse Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  // Main Game Loop Countdown
  useEffect(() => {
    if (!visible) return;

    let timer;
    if (gameState === 'betting') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        startFastSpin();
      }
    }
    return () => clearTimeout(timer);
  }, [visible, gameState, countdown]);

  // High Speed Ferris Light Spin Animation
  const startFastSpin = () => {
    setGameState('spinning');

    // Pick winning food index
    const rand = Math.random();
    let winnerId = 0;
    if (rand < 0.22) winnerId = 0; // Broccoli (5x)
    else if (rand < 0.44) winnerId = 1; // Kiwi (5x)
    else if (rand < 0.64) winnerId = 2; // Avocado (5x)
    else if (rand < 0.80) winnerId = 3; // Tomato (5x)
    else if (rand < 0.90) winnerId = 4; // Swiss Roll (10x)
    else if (rand < 0.96) winnerId = 5; // Hotdog (15x)
    else if (rand < 0.99) winnerId = 6; // Pizza (25x)
    else winnerId = 7; // Chicken (45x)

    const winner = GREEDY_FOODS[winnerId];
    setWinningFood(winner);

    // Fast high-speed rotation around 8 food items:
    // Total 28 steps (3.5 full rotations + landing on target)
    let currentStep = activeIndex || 0;
    const totalSteps = 24 + ((winnerId - (currentStep % 8) + 8) % 8);
    let stepCount = 0;
    let delay = 40; // High speed 40ms per step

    const runStep = () => {
      currentStep = (currentStep + 1) % 8;
      setActiveIndex(currentStep);
      stepCount++;

      if (stepCount >= totalSteps) {
        // Landed on Winner!
        setActiveIndex(winnerId);
        setTimeout(() => {
          handleSpinResult(winner);
        }, 500);
      } else {
        // Gradually slow down in last 8 steps for suspense
        if (totalSteps - stepCount <= 8) {
          delay += 40;
        } else if (totalSteps - stepCount <= 4) {
          delay += 80;
        }
        wheelSpinRef.current = setTimeout(runStep, delay);
      }
    };

    runStep();
  };

  const handleSpinResult = (winner) => {
    setGameState('result');
    setHistory(prev => [winner.id, ...prev.slice(0, 7)]);

    const betOnWinner = bets[winner.id] || 0;
    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

    if (betOnWinner > 0) {
      const winCoins = betOnWinner * winner.multiplier;
      onUpdateCoins(winCoins);
      setTodayEarnings(prev => prev + (winCoins - totalBet));
      setWinModalData({
        won: true,
        food: winner,
        betAmount: betOnWinner,
        winAmount: winCoins
      });
    } else if (totalBet > 0) {
      setTodayEarnings(prev => prev - totalBet);
      setWinModalData({
        won: false,
        food: winner,
        lostAmount: totalBet
      });
    }

    // Reset for next betting round
    setTimeout(() => {
      setWinModalData(null);
      setBets({});
      setWinningFood(null);
      setCountdown(10);
      setGameState('betting');
    }, 3200);
  };

  const handlePlaceBet = (food) => {
    if (gameState !== 'betting') {
      Alert.alert('Betting Closed', 'Wheel abhi ghoom raha hai, kripya thoda intezar karein.');
      return;
    }

    if (userCoins < selectedChip) {
      Alert.alert(
        'Coins Kam Hain 🪙',
        `Aapke paas coins kam hain. Ye bet lagane ke liye kam se kam ${selectedChip} coins chahiye.\nKripya pehle recharge karein.`
      );
      return;
    }

    onUpdateCoins(-selectedChip);
    setBets(prev => ({
      ...prev,
      [food.id]: (prev[food.id] || 0) + selectedChip
    }));
  };

  const handleClearBets = () => {
    if (gameState !== 'betting') return;
    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalBet > 0) {
      onUpdateCoins(totalBet);
      setBets({});
    }
  };

  const totalCurrentBet = Object.values(bets).reduce((a, b) => a + b, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* TOP BAR */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.gameTitle}>Greedy Baby</Text>
          </View>

          <TouchableOpacity style={styles.helpBtn} onPress={() => setRulesVisible(true)}>
            <Text style={styles.helpBtnText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* COIN BALANCE & TODAY EARNINGS */}
        <View style={styles.statusBar}>
          <View style={styles.coinsPill}>
            <Text style={styles.coinsLabel}>Coins:</Text>
            <View style={styles.coinsAmountRow}>
              <Text style={styles.goldCoinIcon}>🪙</Text>
              <Text style={styles.coinsValue}>{userCoins.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.addCoinPlus} onPress={() => Alert.alert('Coins Store', 'Recharge wallet')}>
              <Text style={styles.addCoinPlusText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.earningsPill}>
            <Text style={styles.earningsLabel}>Today Earnings</Text>
            <Text style={[styles.earningsValue, todayEarnings >= 0 ? styles.earningsPositive : styles.earningsNegative]}>
              {todayEarnings >= 0 ? `${todayEarnings.toLocaleString()}` : todayEarnings.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* MAIN FERRIS WHEEL ARENA (FIXED UPWARD PEDESTALS WITH FAST LIGHT INDICATOR) */}
        <View style={styles.wheelContainer}>
          <View style={styles.wheelFrame}>
            {/* Ferris Wheel Spokes Background */}
            <View style={styles.spokeDiagonal1} />
            <View style={styles.spokeDiagonal2} />
            <View style={styles.spokeHorizontal} />
            <View style={styles.spokeVertical} />
            <View style={styles.centerWheelRing} />

            {/* 8 Fixed Food Pedestals around the wheel */}
            {GREEDY_FOODS.map(food => {
              const isSelectedForBet = !!bets[food.id];
              const isLightActive = activeIndex === food.id;
              const isWinner = winningFood?.id === food.id && gameState === 'result';

              return (
                <TouchableOpacity
                  key={food.id}
                  activeOpacity={0.8}
                  style={[
                    styles.foodPedestal,
                    { top: food.pos.top, left: food.pos.left },
                    isLightActive && styles.foodPedestalActiveLight,
                    isWinner && styles.foodPedestalWinner,
                    isSelectedForBet && styles.foodPedestalBetPlaced
                  ]}
                  onPress={() => handlePlaceBet(food)}
                >
                  {/* Food Image / Emoji */}
                  <View style={styles.foodEmojiBox}>
                    <Text style={styles.foodEmojiText}>{food.emoji}</Text>
                  </View>

                  {/* Multiplier Tag Underneath */}
                  <View style={[styles.multiplierBanner, { backgroundColor: isLightActive ? '#f43f5e' : food.color }]}>
                    <Text style={styles.multiplierBannerText}>{food.tag}</Text>
                  </View>

                  {/* Hot Flame Icon */}
                  {food.isHot && (
                    <View style={styles.hotBadge}>
                      <Text style={{ fontSize: 9 }}>🔥</Text>
                    </View>
                  )}

                  {/* User Bet Chip Overlay */}
                  {bets[food.id] > 0 && (
                    <View style={styles.betChipTag}>
                      <Text style={styles.betChipTagText}>🪙{bets[food.id] >= 1000 ? `${bets[food.id]/1000}k` : bets[food.id]}</Text>
                    </View>
                  )}

                  {/* Active Selector Hand Pointer */}
                  {isLightActive && (
                    <View style={styles.selectorHandPointer}>
                      <Text style={{ fontSize: 16 }}>👆</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* CENTRAL HUNGRY BABY MASCOT & COUNTDOWN */}
            <Animated.View style={[styles.centralBabyMascot, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.babyFaceCircle}>
                <Text style={styles.babyFaceEmoji}>😋</Text>
                <View style={styles.forkSpoonBadge}>
                  <Text style={{ fontSize: 11 }}>🍴</Text>
                </View>
              </View>

              {/* Countdown / Status Box */}
              <View style={styles.centralStatusBox}>
                {gameState === 'betting' ? (
                  <>
                    <Text style={styles.centralStatusLabel}>Select Food Now</Text>
                    <Text style={styles.centralStatusTime}>{countdown}</Text>
                  </>
                ) : gameState === 'spinning' ? (
                  <>
                    <Text style={styles.centralStatusLabel}>Spinning...</Text>
                    <Text style={styles.centralStatusSpinIcon}>✨🎡✨</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.centralStatusLabel}>Winner!</Text>
                    <Text style={styles.centralWinnerTag}>{winningFood?.emoji} {winningFood?.tag}</Text>
                  </>
                )}
              </View>
            </Animated.View>
          </View>
        </View>

        {/* BETTING CHIPS BAR */}
        <View style={styles.bettingCard}>
          <View style={styles.bettingCardHeader}>
            <Text style={styles.bettingInstruction}>Choose the amount of wager &gt; Choose food</Text>
            {totalCurrentBet > 0 && gameState === 'betting' && (
              <TouchableOpacity style={styles.clearBetBtn} onPress={handleClearBets}>
                <Text style={styles.clearBetText}>Clear (🪙{totalCurrentBet})</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Chips Row: 10, 50, 100, 1000, 10000 */}
          <View style={styles.chipsRow}>
            {CHIP_VALUES.map(chip => {
              const isSelected = selectedChip === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  activeOpacity={0.8}
                  style={[styles.goldChipBtn, isSelected && styles.goldChipBtnActive]}
                  onPress={() => setSelectedChip(chip)}
                >
                  <View style={styles.goldChipInner}>
                    <Text style={styles.goldChipStar}>🪙</Text>
                    <Text style={[styles.goldChipNumber, isSelected && styles.goldChipNumberActive]}>
                      {chip}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* RECENT RESULTS HISTORY BAR */}
        <View style={styles.historyBar}>
          <Text style={styles.historyLabel}>Result:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
            {history.map((foodId, idx) => {
              const food = GREEDY_FOODS.find(f => f.id === foodId) || GREEDY_FOODS[0];
              return (
                <View key={`hist_${idx}`} style={styles.historyItem}>
                  <Text style={styles.historyEmoji}>{food.emoji}</Text>
                  {idx === 0 && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* BOTTOM LEADERBOARD BAR */}
        <View style={styles.bottomLeaderboard}>
          <View style={styles.weeklyPrizeBox}>
            <Text style={styles.weeklyPrizeLabel}>🌍 Weekly Prize</Text>
            <Text style={styles.weeklyPrizeCoins}>🪙 300K</Text>
          </View>

          <View style={styles.topWinnerCard}>
            <View style={styles.topWinnerAvatar}>
              <Text style={{ fontSize: 14 }}>👑</Text>
            </View>
            <View>
              <Text style={styles.topWinnerTitle}>Today TOP 1</Text>
              <Text style={styles.topWinnerCoins}>🪙 4,648,800</Text>
            </View>
          </View>
        </View>

        {/* WIN / LOSS CELEBRATION POPUP */}
        {winModalData && (
          <View style={styles.winCelebrationOverlay}>
            <View style={[styles.winCard, winModalData.won ? styles.winCardSuccess : styles.winCardFail]}>
              <Text style={styles.winCelebrationEmoji}>
                {winModalData.won ? '🎉 🏆 🎉' : '😢 💔'}
              </Text>
              <Text style={styles.winCardTitle}>
                {winModalData.won ? 'BIG WIN!' : 'Better Luck Next Round!'}
              </Text>

              <View style={styles.winItemRow}>
                <Text style={{ fontSize: 36 }}>{winModalData.food.emoji}</Text>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.winFoodName}>{winModalData.food.name}</Text>
                  <Text style={styles.winMultiplierText}>{winModalData.food.tag}</Text>
                </View>
              </View>

              {winModalData.won ? (
                <View style={styles.winAmountBox}>
                  <Text style={styles.winAmountLabel}>You Won:</Text>
                  <Text style={styles.winAmountValue}>+🪙{winModalData.winAmount.toLocaleString()}</Text>
                </View>
              ) : (
                <Text style={styles.lossText}>Total Bet: 🪙{winModalData.lostAmount}</Text>
              )}
            </View>
          </View>
        )}

        {/* RULES MODAL */}
        <Modal visible={rulesVisible} transparent animationType="fade" onRequestClose={() => setRulesVisible(false)}>
          <View style={styles.rulesOverlay}>
            <View style={styles.rulesCard}>
              <Text style={styles.rulesTitle}>🎡 Greedy Baby Rules</Text>
              <ScrollView style={{ maxHeight: 250 }}>
                <Text style={styles.rulesText}>
                  1. Chip amount chuniye (10, 50, 100, 1K, 10K) aur kisi bhi Food pedestal par tap karke wager lagayein.{'\n\n'}
                  2. <Text style={{ color: '#06b6d4', fontWeight: 'bold' }}>Vegetables & Fruits (5x):</Text> Broccoli, Kiwi, Avocado, Tomato.{'\n\n'}
                  3. <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>Bakery & Fast Food (10x - 25x):</Text> Swiss Roll (10x), Hotdog (15x), Pizza (25x).{'\n\n'}
                  4. <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Grand Prize (45x):</Text> Roast Chicken.{'\n\n'}
                  5. Spin hone ke baad winning food par laga hua bet multiply hokar turant aapke main wallet me add ho jata hai!
                </Text>
              </ScrollView>
              <TouchableOpacity style={styles.rulesCloseBtn} onPress={() => setRulesVisible(false)}>
                <Text style={styles.rulesCloseBtnText}>GOT IT!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b0764', // Deep Royal Purple from screenshot
    paddingTop: 34
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 28
  },
  headerTitleBox: {
    alignItems: 'center'
  },
  gameTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  helpBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  helpBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold'
  },

  // STATUS BAR
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 4
  },
  coinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#facc15',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#fef08a'
  },
  coinsLabel: {
    color: '#713f12',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 3
  },
  coinsAmountRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  goldCoinIcon: {
    fontSize: 11,
    marginRight: 2
  },
  coinsValue: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900'
  },
  addCoinPlus: {
    backgroundColor: '#ca8a04',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  },
  addCoinPlusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  earningsPill: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  earningsLabel: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '700'
  },
  earningsValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#facc15'
  },
  earningsPositive: {
    color: '#facc15'
  },
  earningsNegative: {
    color: '#f87171'
  },

  // FERRIS WHEEL CONTAINER
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    height: 310
  },
  wheelFrame: {
    width: 310,
    height: 310,
    borderRadius: 155,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spokeDiagonal1: {
    position: 'absolute',
    width: 250,
    height: 2,
    backgroundColor: '#06b6d4',
    transform: [{ rotate: '45deg' }]
  },
  spokeDiagonal2: {
    position: 'absolute',
    width: 250,
    height: 2,
    backgroundColor: '#06b6d4',
    transform: [{ rotate: '-45deg' }]
  },
  spokeHorizontal: {
    position: 'absolute',
    width: 250,
    height: 2,
    backgroundColor: '#06b6d4'
  },
  spokeVertical: {
    position: 'absolute',
    height: 250,
    width: 2,
    backgroundColor: '#06b6d4'
  },
  centerWheelRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.4)'
  },

  // 8 FIXED FOOD PEDESTALS (STAYS UPRIGHT AT ALL TIMES)
  foodPedestal: {
    position: 'absolute',
    width: 66,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10
  },
  foodPedestalActiveLight: {
    borderColor: '#ec4899',
    borderWidth: 3.5,
    backgroundColor: '#fdf2f8',
    transform: [{ scale: 1.1 }],
    zIndex: 30,
    shadowColor: '#ec4899',
    shadowOpacity: 0.9,
    shadowRadius: 8
  },
  foodPedestalWinner: {
    borderColor: '#22c55e',
    borderWidth: 3.5,
    backgroundColor: '#f0fdf4',
    transform: [{ scale: 1.15 }],
    zIndex: 35
  },
  foodPedestalBetPlaced: {
    borderColor: '#facc15',
    borderWidth: 2.5
  },
  foodEmojiBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  foodEmojiText: {
    fontSize: 24
  },
  multiplierBanner: {
    width: '92%',
    paddingVertical: 1,
    borderRadius: 6,
    alignItems: 'center'
  },
  multiplierBannerText: {
    color: '#ffffff',
    fontSize: 7.5,
    fontWeight: '900'
  },
  hotBadge: {
    position: 'absolute',
    top: -5,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 1
  },
  betChipTag: {
    position: 'absolute',
    top: -6,
    left: -4,
    backgroundColor: '#eab308',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#fef08a'
  },
  betChipTagText: {
    color: '#000',
    fontSize: 7.5,
    fontWeight: '900'
  },
  selectorHandPointer: {
    position: 'absolute',
    bottom: -14,
    right: -8,
    zIndex: 40
  },

  // CENTRAL HUNGRY BABY MASCOT & COUNTDOWN
  centralBabyMascot: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fb923c',
    borderWidth: 3,
    borderColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20
  },
  babyFaceCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  babyFaceEmoji: {
    fontSize: 28
  },
  forkSpoonBadge: {
    position: 'absolute',
    right: -10,
    top: -6
  },
  centralStatusBox: {
    backgroundColor: '#4c1d95',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 1,
    borderWidth: 1,
    borderColor: '#c084fc',
    alignItems: 'center'
  },
  centralStatusLabel: {
    color: '#e2e8f0',
    fontSize: 7,
    fontWeight: '700'
  },
  centralStatusTime: {
    color: '#facc15',
    fontSize: 9.5,
    fontWeight: '900'
  },
  centralStatusSpinIcon: {
    fontSize: 8
  },
  centralWinnerTag: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: 'bold'
  },

  // BETTING CARD
  bettingCard: {
    backgroundColor: '#4c1d95',
    marginHorizontal: 12,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)'
  },
  bettingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  bettingInstruction: {
    color: '#e9d5ff',
    fontSize: 10.5,
    fontWeight: '700'
  },
  clearBetBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  clearBetText: {
    color: '#fca5a5',
    fontSize: 8.5,
    fontWeight: 'bold'
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  goldChipBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  goldChipBtnActive: {
    backgroundColor: '#ef4444',
    borderColor: '#fca5a5',
    borderWidth: 2,
    transform: [{ scale: 1.05 }]
  },
  goldChipInner: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  goldChipStar: {
    fontSize: 14
  },
  goldChipNumber: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#1e293b'
  },
  goldChipNumberActive: {
    color: '#ffffff'
  },

  // HISTORY RESULTS BAR
  historyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    marginHorizontal: 12,
    marginTop: 6,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  historyLabel: {
    color: '#93c5fd',
    fontSize: 10.5,
    fontWeight: '800',
    marginRight: 6
  },
  historyScroll: {
    alignItems: 'center',
    gap: 8
  },
  historyItem: {
    alignItems: 'center',
    position: 'relative'
  },
  historyEmoji: {
    fontSize: 16
  },
  newBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#eab308',
    borderRadius: 3,
    paddingHorizontal: 2
  },
  newBadgeText: {
    color: '#000',
    fontSize: 6,
    fontWeight: '900'
  },

  // BOTTOM LEADERBOARD
  bottomLeaderboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)'
  },
  weeklyPrizeBox: {
    gap: 1
  },
  weeklyPrizeLabel: {
    color: '#f472b6',
    fontSize: 9.5,
    fontWeight: '700'
  },
  weeklyPrizeCoins: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: '900'
  },
  topWinnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  topWinnerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center'
  },
  topWinnerTitle: {
    color: '#f8fafc',
    fontSize: 9.5,
    fontWeight: '700'
  },
  topWinnerCoins: {
    color: '#facc15',
    fontSize: 11,
    fontWeight: '900'
  },

  // CELEBRATION MODAL
  winCelebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  winCard: {
    width: '80%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2
  },
  winCardSuccess: {
    backgroundColor: '#1e1b4b',
    borderColor: '#22c55e'
  },
  winCardFail: {
    backgroundColor: '#1f132b',
    borderColor: '#ef4444'
  },
  winCelebrationEmoji: {
    fontSize: 30,
    marginBottom: 4
  },
  winCardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8
  },
  winItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10
  },
  winFoodName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  winMultiplierText: {
    color: '#facc15',
    fontSize: 11,
    fontWeight: '900'
  },
  winAmountBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
    alignItems: 'center'
  },
  winAmountLabel: {
    color: '#86efac',
    fontSize: 10,
    fontWeight: '600'
  },
  winAmountValue: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '900'
  },
  lossText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: 'bold'
  },

  // RULES MODAL
  rulesOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  rulesCard: {
    width: '100%',
    backgroundColor: '#1b123a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#a855f7'
  },
  rulesTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center'
  },
  rulesText: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18
  },
  rulesCloseBtn: {
    backgroundColor: '#9333ea',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 12
  },
  rulesCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  }
});
