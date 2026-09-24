import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { GreedyBabyGameModal } from './GreedyBabyGameModal';
import { TeenPattiGameModal } from './TeenPattiGameModal';
import { SuperSlotsGameModal } from './SuperSlotsGameModal';

export const GameCenterModal = ({
  visible,
  onClose,
  userCoins = 0,
  onUpdateCoins
}) => {
  const [activeGame, setActiveGame] = useState(null); // 'greedy' | 'teenpatti' | 'slots' | null

  const gamesList = [
    {
      id: 'greedy',
      title: 'Greedy Baby (लालची पहिया)',
      subTitle: 'Spin the Ferris Wheel & Win up to 45x!',
      tag: '🔥 HOT POPULAR',
      badgeColor: '#ef4444',
      icon: '🎡',
      coinsMultiplier: 'Win up to 45x',
      gradientColor: '#4c1d95',
      borderColor: '#a855f7'
    },
    {
      id: 'teenpatti',
      title: 'Teen Patti Master (3 पत्ती)',
      subTitle: 'Classic 3-Card Table with Trail & Pure Seq',
      tag: '♠️ CASINO',
      badgeColor: '#3b82f6',
      icon: '🃏',
      coinsMultiplier: 'Win up to 50x',
      gradientColor: '#1e293b',
      borderColor: '#38bdf8'
    },
    {
      id: 'slots',
      title: 'Super 777 Slots (जैकपॉट स्लॉट्स)',
      subTitle: 'Spin Vegas Reels & Hit Triple Jackpot',
      tag: '🎰 JACKPOT',
      badgeColor: '#eab308',
      icon: '🎰',
      coinsMultiplier: 'Win 500K Jackpot',
      gradientColor: '#311042',
      borderColor: '#f472b6'
    }
  ];

  return (
    <>
      <Modal visible={visible && !activeGame} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* HEADER */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>🎮 Game Arena</Text>
                <Text style={styles.subTitle}>Play Games & Win Free Coins</Text>
              </View>

              <View style={styles.headerRight}>
                {/* Coins Pill */}
                <View style={styles.coinPill}>
                  <Text style={{ fontSize: 13 }}>🪙</Text>
                  <Text style={styles.coinText}>{userCoins.toLocaleString()}</Text>
                </View>

                {/* Close Button */}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* GAMES LIST */}
            <ScrollView style={styles.gamesScroll} showsVerticalScrollIndicator={false}>
              {gamesList.map(game => (
                <TouchableOpacity
                  key={game.id}
                  style={[
                    styles.gameCard,
                    { backgroundColor: game.gradientColor, borderColor: game.borderColor }
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setActiveGame(game.id)}
                >
                  <View style={styles.gameIconContainer}>
                    <Text style={styles.gameIconText}>{game.icon}</Text>
                  </View>

                  <View style={styles.gameInfo}>
                    <View style={styles.tagRow}>
                      <View style={[styles.gameTag, { backgroundColor: game.badgeColor }]}>
                        <Text style={styles.gameTagText}>{game.tag}</Text>
                      </View>
                    </View>
                    <Text style={styles.gameName}>{game.title}</Text>
                    <Text style={styles.gameDesc}>{game.subTitle}</Text>
                    <Text style={styles.gameMultiplier}>{game.coinsMultiplier}</Text>
                  </View>

                  <View style={styles.playNowBtn}>
                    <Text style={styles.playNowText}>PLAY</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* GREEDY BABY GAME */}
      {activeGame === 'greedy' && (
        <GreedyBabyGameModal
          visible={true}
          onClose={() => setActiveGame(null)}
          userCoins={userCoins}
          onUpdateCoins={onUpdateCoins}
        />
      )}

      {/* TEEN PATTI GAME */}
      {activeGame === 'teenpatti' && (
        <TeenPattiGameModal
          visible={true}
          onClose={() => setActiveGame(null)}
          userCoins={userCoins}
          onUpdateCoins={onUpdateCoins}
        />
      )}

      {/* SUPER SLOTS GAME */}
      {activeGame === 'slots' && (
        <SuperSlotsGameModal
          visible={true}
          onClose={() => setActiveGame(null)}
          userCoins={userCoins}
          onUpdateCoins={onUpdateCoins}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: '#120b29',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(168, 85, 247, 0.4)',
    padding: 16,
    maxHeight: '80%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900'
  },
  subTitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
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
  coinText: {
    color: '#facc15',
    fontWeight: '900',
    fontSize: 12
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  gamesScroll: {
    paddingVertical: 4
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  gameIconText: {
    fontSize: 32
  },
  gameInfo: {
    flex: 1
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  gameTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6
  },
  gameTagText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '900'
  },
  gameName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  gameDesc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10.5,
    marginTop: 2
  },
  gameMultiplier: {
    color: '#facc15',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 3
  },
  playNowBtn: {
    backgroundColor: '#facc15',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3
  },
  playNowText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900'
  }
});
