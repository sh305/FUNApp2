import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useWindowDimensions
} from 'react-native';
import { COLORS } from '../../constants/theme';

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const BET_OPTIONS = [
  { id: 'player', label: 'Player Wins', multiplier: 2, color: '#3b82f6' },
  { id: 'pair', label: 'Pair (जोड़ी)', multiplier: 3, color: '#8b5cf6' },
  { id: 'color', label: 'Color (रंग)', multiplier: 8, color: '#ec4899' },
  { id: 'sequence', label: 'Sequence (सीक्वेंस)', multiplier: 15, color: '#f59e0b' },
  { id: 'pure_sequence', label: 'Pure Seq (प्योर)', multiplier: 30, color: '#10b981' },
  { id: 'trail', label: 'Trail / Trio (तीन पत्ती)', multiplier: 50, color: '#ef4444' }
];

const CHIPS = [10, 50, 100, 500, 2000];

export const TeenPattiGameModal = ({ visible, onClose, userCoins = 0, onUpdateCoins }) => {
  const [selectedChip, setSelectedChip] = useState(10);
  const [bets, setBets] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerCards, setPlayerCards] = useState([
    { val: 'A', suit: '♠️' },
    { val: 'K', suit: '♠️' },
    { val: 'Q', suit: '♠️' }
  ]);
  const [dealerCards, setDealerCards] = useState([
    { val: '10', suit: '♦️' },
    { val: '10', suit: '♣️' },
    { val: '7', suit: '♥️' }
  ]);
  const [gameResult, setGameResult] = useState(null);

  const getRandomCard = () => {
    const val = VALUES[Math.floor(Math.random() * VALUES.length)];
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return { val, suit };
  };

  const handlePlaceBet = (betId) => {
    if (isPlaying) return;
    if (userCoins < selectedChip) {
      Alert.alert('Coins Kam Hain 🪙', 'Aapke paas coins kam hain. Kripya recharge karein.');
      return;
    }
    onUpdateCoins(-selectedChip);
    setBets(prev => ({
      ...prev,
      [betId]: (prev[betId] || 0) + selectedChip
    }));
  };

  const handleDeal = () => {
    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalBet === 0) {
      Alert.alert('Bet Lagayein', 'Khelne ke liye pehle kisi option par bet lagayein.');
      return;
    }

    setIsPlaying(true);
    setGameResult(null);

    // Deal cards after small suspense delay
    setTimeout(() => {
      const p1 = getRandomCard();
      const p2 = getRandomCard();
      const p3 = getRandomCard();

      const d1 = getRandomCard();
      const d2 = getRandomCard();
      const d3 = getRandomCard();

      const newPlayerCards = [p1, p2, p3];
      const newDealerCards = [d1, d2, d3];

      setPlayerCards(newPlayerCards);
      setDealerCards(newDealerCards);

      // Evaluate Hand
      const isTrail = p1.val === p2.val && p2.val === p3.val;
      const isColor = p1.suit === p2.suit && p2.suit === p3.suit;
      const isPair = p1.val === p2.val || p2.val === p3.val || p1.val === p3.val;
      const isPlayerWinner = Math.random() > 0.45;

      let wonAmount = 0;
      let winReasons = [];

      if (bets['player'] && isPlayerWinner) {
        wonAmount += bets['player'] * 2;
        winReasons.push('Player Won (2x)');
      }
      if (bets['trail'] && isTrail) {
        wonAmount += bets['trail'] * 50;
        winReasons.push('Trio / Trail (50x)');
      }
      if (bets['color'] && isColor) {
        wonAmount += bets['color'] * 8;
        winReasons.push('Color Flush (8x)');
      }
      if (bets['pair'] && isPair) {
        wonAmount += bets['pair'] * 3;
        winReasons.push('Pair (3x)');
      }

      if (wonAmount > 0) {
        onUpdateCoins(wonAmount);
        setGameResult({
          won: true,
          amount: wonAmount,
          message: winReasons.join(', ')
        });
      } else {
        setGameResult({
          won: false,
          amount: totalBet,
          message: isPlayerWinner ? 'Dealer Won' : 'Better Luck Next Hand'
        });
      }

      setIsPlaying(false);
      setBets({});
    }, 1200);
  };

  const handleClearBets = () => {
    if (isPlaying) return;
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
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Teen Patti Master</Text>
            <Text style={styles.subTitle}>3-Card High Stakes ♠️</Text>
          </View>
          <View style={styles.coinPill}>
            <Text style={{ fontSize: 13 }}>🪙</Text>
            <Text style={styles.coinVal}>{userCoins.toLocaleString()}</Text>
          </View>
        </View>

        {/* DEALER AREA */}
        <View style={styles.tableArea}>
          <Text style={styles.handTitle}>🎩 Dealer Hand</Text>
          <View style={styles.cardsRow}>
            {dealerCards.map((c, i) => (
              <View key={`d_${i}`} style={styles.playingCard}>
                <Text style={styles.cardVal}>{c.val}</Text>
                <Text style={styles.cardSuit}>{c.suit}</Text>
              </View>
            ))}
          </View>

          {/* VS BADGE */}
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* PLAYER AREA */}
          <Text style={styles.handTitle}>🌟 Player Hand</Text>
          <View style={styles.cardsRow}>
            {playerCards.map((c, i) => (
              <View key={`p_${i}`} style={[styles.playingCard, styles.playerCardHighlight]}>
                <Text style={styles.cardVal}>{c.val}</Text>
                <Text style={styles.cardSuit}>{c.suit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* BETTING OPTIONS GRID */}
        <View style={styles.betsContainer}>
          <Text style={styles.betGridTitle}>Select Bet Option (बहुविकल्प बेट):</Text>
          <View style={styles.betsGrid}>
            {BET_OPTIONS.map(opt => {
              const currentBet = bets[opt.id] || 0;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.betOptionCard, { borderColor: opt.color }]}
                  onPress={() => handlePlaceBet(opt.id)}
                >
                  <Text style={styles.betOptionLabel}>{opt.label}</Text>
                  <Text style={[styles.betOptionMultiplier, { color: opt.color }]}>{opt.multiplier}x</Text>
                  {currentBet > 0 && (
                    <View style={styles.activeBetBadge}>
                      <Text style={styles.activeBetText}>🪙{currentBet}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CHIP SELECTOR & DEAL BUTTON */}
        <View style={styles.controlsFooter}>
          <View style={styles.chipsRow}>
            {CHIPS.map(chip => (
              <TouchableOpacity
                key={chip}
                style={[styles.chipBtn, selectedChip === chip && styles.chipBtnActive]}
                onPress={() => setSelectedChip(chip)}
              >
                <Text style={styles.chipVal}>{chip >= 1000 ? `${chip / 1000}K` : chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dealActionsRow}>
            {totalCurrentBet > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearBets}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.dealBtn, isPlaying && styles.dealBtnDisabled]}
              disabled={isPlaying}
              onPress={handleDeal}
            >
              <Text style={styles.dealBtnText}>{isPlaying ? 'Dealing...' : `DEAL (🪙${totalCurrentBet})`}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RESULT POPUP */}
        {gameResult && (
          <View style={styles.resultToast}>
            <Text style={styles.resultTitle}>
              {gameResult.won ? `🎉 YOU WON +🪙${gameResult.amount.toLocaleString()}!` : `💔 DEALER TOOK 🪙${gameResult.amount}`}
            </Text>
            <Text style={styles.resultSub}>{gameResult.message}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 36
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900'
  },
  subTitle: {
    color: '#f59e0b',
    fontSize: 11
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
    gap: 4
  },
  coinVal: {
    color: '#facc15',
    fontWeight: 'bold',
    fontSize: 12
  },
  tableArea: {
    backgroundColor: '#1e293b',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  handTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10
  },
  playingCard: {
    width: 50,
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4
  },
  playerCardHighlight: {
    borderWidth: 2,
    borderColor: '#f59e0b'
  },
  cardVal: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cardSuit: {
    fontSize: 16
  },
  vsBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginVertical: 6
  },
  vsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10
  },
  betsContainer: {
    marginHorizontal: 12,
    marginTop: 10
  },
  betGridTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6
  },
  betsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between'
  },
  betOptionCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    position: 'relative'
  },
  betOptionLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  betOptionMultiplier: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2
  },
  activeBetBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#eab308',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  activeBetText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900'
  },
  controlsFooter: {
    marginTop: 'auto',
    backgroundColor: '#1e293b',
    padding: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  chipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#64748b'
  },
  chipBtnActive: {
    backgroundColor: '#eab308',
    borderColor: '#fef08a',
    transform: [{ scale: 1.1 }]
  },
  chipVal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11
  },
  dealActionsRow: {
    flexDirection: 'row',
    gap: 10
  },
  clearBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearText: {
    color: '#ef4444',
    fontWeight: 'bold'
  },
  dealBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dealBtnDisabled: {
    opacity: 0.6
  },
  dealBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900'
  },
  resultToast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38bdf8',
    zIndex: 50
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900'
  },
  resultSub: {
    color: '#facc15',
    fontSize: 12,
    marginTop: 2
  }
});
