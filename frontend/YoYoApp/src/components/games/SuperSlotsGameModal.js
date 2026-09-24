import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { COLORS } from '../../constants/theme';

const SLOT_SYMBOLS = [
  { id: '7', emoji: '7️⃣', name: 'Lucky 7', multiplier: 50, color: '#ef4444' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', multiplier: 35, color: '#38bdf8' },
  { id: 'crown', emoji: '👑', name: 'Golden Crown', multiplier: 25, color: '#eab308' },
  { id: 'bell', emoji: '🔔', name: 'Vegas Bell', multiplier: 15, color: '#f59e0b' },
  { id: 'cherry', emoji: '🍒', name: 'Sweet Cherry', multiplier: 10, color: '#f43f5e' },
  { id: 'lemon', emoji: '🍋', name: 'Golden Lemon', multiplier: 5, color: '#84cc16' }
];

const BET_AMOUNTS = [10, 50, 100, 500, 1000];

export const SuperSlotsGameModal = ({ visible, onClose, userCoins = 0, onUpdateCoins }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [selectedBet, setSelectedBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([SLOT_SYMBOLS[0], SLOT_SYMBOLS[1], SLOT_SYMBOLS[2]]);
  const [lastWin, setLastWin] = useState(null);
  const [bulbToggle, setBulbToggle] = useState(false);

  // Drum rotation animated values
  const rollAnim1 = useRef(new Animated.Value(0)).current;
  const rollAnim2 = useRef(new Animated.Value(0)).current;
  const rollAnim3 = useRef(new Animated.Value(0)).current;
  const leverAnim = useRef(new Animated.Value(0)).current;

  // Flashing arcade bulbs
  useEffect(() => {
    const interval = setInterval(() => {
      setBulbToggle(prev => !prev);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss win popup after 2.5 seconds
  useEffect(() => {
    if (lastWin) {
      const t = setTimeout(() => {
        setLastWin(null);
      }, 2800);
      return () => clearTimeout(t);
    }
  }, [lastWin]);

  const handleSpin = () => {
    if (isSpinning) return;
    if (userCoins < selectedBet) {
      Alert.alert('Coins Kam Hain 🪙', 'Aapke paas coins kam hain. Kripya pehle recharge karein.');
      return;
    }

    onUpdateCoins(-selectedBet);
    setIsSpinning(true);
    setLastWin(null);

    // Pull lever down animation
    Animated.sequence([
      Animated.timing(leverAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(leverAnim, { toValue: 0, duration: 250, useNativeDriver: true })
    ]).start();

    // Decide final 3 symbols
    // Controlled win rate: ~15% chance to hit a 3-of-a-kind match
    const willWin = Math.random() < 0.16;
    let s1, s2, s3;

    if (willWin) {
      // Pick symbol for 3-match
      const randSym = Math.random();
      let winSym;
      if (randSym < 0.05) winSym = SLOT_SYMBOLS[0]; // 777 (50x)
      else if (randSym < 0.12) winSym = SLOT_SYMBOLS[1]; // Diamond (35x)
      else if (randSym < 0.22) winSym = SLOT_SYMBOLS[2]; // Crown (25x)
      else if (randSym < 0.40) winSym = SLOT_SYMBOLS[3]; // Bell (15x)
      else if (randSym < 0.65) winSym = SLOT_SYMBOLS[4]; // Cherry (10x)
      else winSym = SLOT_SYMBOLS[5]; // Lemon (5x)

      s1 = winSym;
      s2 = winSym;
      s3 = winSym;
    } else {
      // Non-winning spin: guaranteed NOT all 3 matching
      s1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      s2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      s3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];

      if (s1.id === s2.id && s2.id === s3.id) {
        // Change one symbol so it's strictly not 3-match
        const otherSyms = SLOT_SYMBOLS.filter(s => s.id !== s1.id);
        s3 = otherSyms[Math.floor(Math.random() * otherSyms.length)];
      }
    }

    // Reset Roll Values
    rollAnim1.setValue(0);
    rollAnim2.setValue(0);
    rollAnim3.setValue(0);

    // Bingo / Drum continuous rolling animation
    Animated.parallel([
      Animated.timing(rollAnim1, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(rollAnim2, {
        toValue: 1,
        duration: 1300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(rollAnim3, {
        toValue: 1,
        duration: 1700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      })
    ]).start(() => {
      setReels([s1, s2, s3]);
      setIsSpinning(false);

      // ONLY 3-OF-A-KIND WINS (as requested!)
      if (s1.id === s2.id && s2.id === s3.id) {
        const winAmount = selectedBet * s1.multiplier;
        onUpdateCoins(winAmount);
        setLastWin({
          isJackpot: s1.id === '7',
          amount: winAmount,
          symbol: s1
        });
      }
    });
  };

  const leverTranslateY = leverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28]
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* TOP BAR */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Super 777 Slots</Text>
            <Text style={styles.subTitle}>Bingo Rotating Machine 🎰</Text>
          </View>

          <View style={styles.coinPill}>
            <Text style={{ fontSize: 12 }}>🪙</Text>
            <Text style={styles.coinVal}>{userCoins.toLocaleString()}</Text>
          </View>
        </View>

        {/* NEON JACKPOT ARCH & FLASHING BULBS */}
        <View style={styles.arcadeArch}>
          <View style={styles.bulbsRow}>
            {['🔴', '🟡', '🟢', '🔵', '🟣', '🟡', '🔴'].map((bulb, idx) => (
              <Text key={idx} style={[styles.arcadeBulb, bulbToggle && idx % 2 === 0 && { opacity: 0.3 }]}>
                {bulb}
              </Text>
            ))}
          </View>

          <View style={styles.jackpotCenterBadge}>
            <Text style={styles.jackpotCrown}>👑 SUPER BINGO JACKPOT 👑</Text>
            <Text style={styles.jackpotCoinsValue}>🪙 500,000 COINS</Text>
          </View>
        </View>

        {/* 3D BINGO ROTATING DRUM MACHINE CABINET */}
        <View style={styles.machineStage}>
          {/* Main Drum Frame */}
          <View style={styles.drumCabinet}>
            {/* Top Chrome Bevel */}
            <View style={styles.drumTopBevel}>
              <Text style={styles.drumBevelText}>★ MATCH 3 SAME TO WIN ★</Text>
            </View>

            {/* 3 Rotating Cylinder Drum Slots */}
            <View style={styles.drumsRow}>
              {/* REEL 1 */}
              <View style={styles.cylinderDrum}>
                <View style={styles.drumGlassReflection} />
                <Text style={[styles.drumSymbolText, isSpinning && styles.drumSymbolSpinning]}>
                  {isSpinning ? '🌀' : reels[0].emoji}
                </Text>
                {!isSpinning && <Text style={styles.drumSymbolName}>{reels[0].name}</Text>}
              </View>

              {/* REEL 2 */}
              <View style={styles.cylinderDrum}>
                <View style={styles.drumGlassReflection} />
                <Text style={[styles.drumSymbolText, isSpinning && styles.drumSymbolSpinning]}>
                  {isSpinning ? '🌀' : reels[1].emoji}
                </Text>
                {!isSpinning && <Text style={styles.drumSymbolName}>{reels[1].name}</Text>}
              </View>

              {/* REEL 3 */}
              <View style={styles.cylinderDrum}>
                <View style={styles.drumGlassReflection} />
                <Text style={[styles.drumSymbolText, isSpinning && styles.drumSymbolSpinning]}>
                  {isSpinning ? '🌀' : reels[2].emoji}
                </Text>
                {!isSpinning && <Text style={styles.drumSymbolName}>{reels[2].name}</Text>}
              </View>
            </View>

            {/* Red Laser Payline */}
            <View style={styles.paylineLaser} />

            {/* Bottom Drum Bevel */}
            <View style={styles.drumBottomBevel}>
              <Text style={styles.drumBevelSub}>HIGH VOLATILITY • INSTANT PAYOUT</Text>
            </View>
          </View>

          {/* Mechanical Lever Handle on Right Side */}
          <View style={styles.leverHousing}>
            <View style={styles.leverBase} />
            <Animated.View style={[styles.leverRod, { transform: [{ translateY: leverTranslateY }] }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSpin}
                disabled={isSpinning}
                style={styles.leverKnob}
              >
                <Text style={styles.leverKnobIcon}>🔴</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* PAYTABLE ODDS (ONLY 3 MATCHING) */}
        <View style={styles.oddsCard}>
          <Text style={styles.oddsTitle}>3-Match Multiplier Payouts:</Text>
          <View style={styles.oddsGrid}>
            {SLOT_SYMBOLS.map(sym => (
              <View key={sym.id} style={styles.oddsCol}>
                <Text style={styles.oddsEmoji}>{sym.emoji}</Text>
                <Text style={[styles.oddsMultiplier, { color: sym.color }]}>{sym.multiplier}x</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CONTROLS & SPIN ACTION */}
        <View style={styles.footerControls}>
          <Text style={styles.wagerLabel}>Choose Bet Amount:</Text>
          <View style={styles.betsRow}>
            {BET_AMOUNTS.map(bet => (
              <TouchableOpacity
                key={bet}
                activeOpacity={0.8}
                style={[styles.betPill, selectedBet === bet && styles.betPillActive]}
                onPress={() => setSelectedBet(bet)}
              >
                <Text style={[styles.betPillText, selectedBet === bet && styles.betPillTextActive]}>
                  🪙{bet}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.bigSpinBtn, isSpinning && styles.bigSpinBtnDisabled]}
            disabled={isSpinning}
            onPress={handleSpin}
          >
            <Text style={styles.bigSpinText}>
              {isSpinning ? 'SPINNING DRUMS...' : `SPIN (🪙${selectedBet})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AUTO-DISMISSING WIN TOAST POPUP */}
        {lastWin && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.winCelebrationToast}
            onPress={() => setLastWin(null)}
          >
            <Text style={{ fontSize: 36 }}>{lastWin.isJackpot ? '🎉 777 JACKPOT! 🏆' : '✨ 3-MATCH WIN! ✨'}</Text>
            <View style={styles.winMatchRow}>
              <Text style={{ fontSize: 26 }}>{lastWin.symbol.emoji} {lastWin.symbol.emoji} {lastWin.symbol.emoji}</Text>
            </View>
            <Text style={styles.winCoinsText}>+🪙{lastWin.amount.toLocaleString()} COINS</Text>
            <Text style={styles.tapToCloseTip}>Tap anywhere to dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b0933', // Dark Vegas Neon Purple
    paddingTop: 36
  },
  header: {
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtnText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 28
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900'
  },
  subTitle: {
    color: '#facc15',
    fontSize: 10.5
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eab308',
    gap: 3
  },
  coinVal: {
    color: '#facc15',
    fontWeight: 'bold',
    fontSize: 12
  },

  // ARCADE ARCH & FLASHING BULBS
  arcadeArch: {
    backgroundColor: '#380c5e',
    marginHorizontal: 12,
    marginTop: 6,
    borderRadius: 16,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f59e0b'
  },
  bulbsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4
  },
  arcadeBulb: {
    fontSize: 12
  },
  jackpotCenterBadge: {
    alignItems: 'center'
  },
  jackpotCrown: {
    color: '#fde047',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  jackpotCoinsValue: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    textShadowColor: '#eab308',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },

  // 3D BINGO DRUM MACHINE
  machineStage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginTop: 12
  },
  drumCabinet: {
    flex: 1,
    backgroundColor: '#0c0418',
    borderRadius: 22,
    borderWidth: 3.5,
    borderColor: '#eab308',
    padding: 10,
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
    position: 'relative'
  },
  drumTopBevel: {
    backgroundColor: '#eab308',
    borderRadius: 6,
    paddingVertical: 2,
    alignItems: 'center',
    marginBottom: 8
  },
  drumBevelText: {
    color: '#000000',
    fontSize: 9.5,
    fontWeight: '900'
  },
  drumsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  cylinderDrum: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#cbd5e1',
    position: 'relative',
    overflow: 'hidden'
  },
  drumGlassReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(203, 213, 225, 0.5)'
  },
  drumSymbolText: {
    fontSize: 48
  },
  drumSymbolSpinning: {
    transform: [{ scale: 1.1 }]
  },
  drumSymbolName: {
    color: '#334155',
    fontSize: 9.5,
    fontWeight: 'bold',
    marginTop: 3
  },
  paylineLaser: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: '52%',
    height: 2.5,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6
  },
  drumBottomBevel: {
    marginTop: 8,
    alignItems: 'center'
  },
  drumBevelSub: {
    color: '#94a3b8',
    fontSize: 7.5,
    fontWeight: 'bold'
  },

  // LEVER HANDLE
  leverHousing: {
    width: 28,
    height: 120,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  leverBase: {
    width: 14,
    height: 60,
    backgroundColor: '#475569',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94a3b8'
  },
  leverRod: {
    position: 'absolute',
    top: 10,
    alignItems: 'center'
  },
  leverKnob: {
    padding: 4
  },
  leverKnobIcon: {
    fontSize: 22
  },

  // ODDS PAYTABLE
  oddsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  oddsTitle: {
    color: '#e2e8f0',
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 4
  },
  oddsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  oddsCol: {
    alignItems: 'center'
  },
  oddsEmoji: {
    fontSize: 16
  },
  oddsMultiplier: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1
  },

  // FOOTER CONTROLS
  footerControls: {
    marginTop: 'auto',
    backgroundColor: '#0f051e',
    padding: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  wagerLabel: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: 'bold',
    marginBottom: 6
  },
  betsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  betPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  betPillActive: {
    backgroundColor: '#eab308',
    borderColor: '#fef08a'
  },
  betPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  betPillTextActive: {
    color: '#000000'
  },
  bigSpinBtn: {
    backgroundColor: '#ec4899',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#f472b6',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6
  },
  bigSpinBtnDisabled: {
    opacity: 0.6
  },
  bigSpinText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8
  },

  // WIN POPUP TOAST
  winCelebrationToast: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: '#1e1b4b',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#eab308',
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 100
  },
  winMatchRow: {
    marginVertical: 6
  },
  winCoinsText: {
    color: '#4ade80',
    fontSize: 22,
    fontWeight: '900'
  },
  tapToCloseTip: {
    color: '#94a3b8',
    fontSize: 9.5,
    marginTop: 6
  }
});
