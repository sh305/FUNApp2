import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../constants/theme';
import { GIFTS } from '../constants/gifts';

export const SendGiftModal = ({
  visible,
  onClose,
  recipients = [],
  currentCoins = 0,
  onSendGift
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [selectedGift, setSelectedGift] = useState(GIFTS[0]);
  const [selectedRecipientId, setSelectedRecipientId] = useState(
    recipients.length > 0 ? recipients[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalCost = selectedGift ? selectedGift.coinPrice * quantity : 0;
  const canAfford = currentCoins >= totalCost;

  const handleSend = async () => {
    if (!selectedRecipientId) {
      setErrorMsg('Kripya gift lene wale user ko select karein.');
      return;
    }
    if (!canAfford) {
      setErrorMsg('Coins kam hain! Recharge karein.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await onSendGift({
        receiverUserId: selectedRecipientId,
        giftId: selectedGift.id,
        quantity
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gift send karne me error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <SafeAreaView style={[styles.modalSheet, { maxHeight: Math.min(windowHeight * 0.88, 620) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.walletBox}>
              <Text style={styles.walletIcon}>🪙</Text>
              <Text style={styles.walletText}>{currentCoins.toLocaleString()} Coins</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Select Recipient */}
            <Text style={styles.sectionTitle}>Send To:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recipientsList}
            >
              {recipients.map(r => {
                const isSelected = selectedRecipientId === r.id;
                return (
                  <TouchableOpacity
                    key={`recip_${r.id}`}
                    style={[
                      styles.recipientChip,
                      isSelected && styles.recipientChipSelected
                    ]}
                    onPress={() => setSelectedRecipientId(r.id)}
                  >
                    <Text style={styles.recipientName} numberOfLines={1}>
                      {r.displayName}
                    </Text>
                    {r.seatIndex !== undefined && (
                      <Text style={styles.recipientSeat}>Seat {r.seatIndex + 1}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Gifts Grid */}
            <Text style={styles.sectionTitle}>Select Gift:</Text>
            <View style={styles.giftsGrid}>
              {GIFTS.map(gift => {
                const isSelected = selectedGift.id === gift.id;
                return (
                  <TouchableOpacity
                    key={`gift_${gift.id}`}
                    style={[styles.giftCard, isSelected && styles.giftCardSelected]}
                    onPress={() => setSelectedGift(gift)}
                  >
                    <Text style={styles.giftIcon}>{gift.icon}</Text>
                    <Text style={styles.giftName} numberOfLines={1}>{gift.name}</Text>
                    <Text style={styles.giftPrice}>🪙 {gift.coinPrice}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantityRow}>
              <Text style={styles.qtyLabel}>Quantity:</Text>
              {[1, 5, 10, 99].map(q => (
                <TouchableOpacity
                  key={`qty_${q}`}
                  style={[styles.qtyBtn, quantity === q && styles.qtyBtnActive]}
                  onPress={() => setQuantity(q)}
                >
                  <Text
                    style={[
                      styles.qtyBtnText,
                      quantity === q && styles.qtyBtnTextActive
                    ]}
                  >
                    {q}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </ScrollView>

          {/* Fixed Footer Action */}
          <TouchableOpacity
            style={[styles.sendBtn, !canAfford && styles.sendBtnDisabled]}
            disabled={loading || !canAfford}
            onPress={handleSend}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.sendBtnText}>
                Send {quantity > 1 ? `${quantity}x ` : ''}{selectedGift.name} (🪙 {totalCost})
              </Text>
            )}
          </TouchableOpacity>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: '100%',
    maxWidth: 500
  },
  scrollContent: {
    paddingBottom: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  walletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gold
  },
  walletIcon: {
    fontSize: 15,
    marginRight: 6
  },
  walletText: {
    color: COLORS.gold,
    fontWeight: 'bold',
    fontSize: 12
  },
  closeBtn: {
    padding: 6
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: 'bold'
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginVertical: 4,
    textTransform: 'uppercase'
  },
  recipientsList: {
    marginBottom: 10
  },
  recipientChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  recipientChipSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0, 240, 255, 0.15)'
  },
  recipientName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600'
  },
  recipientSeat: {
    color: COLORS.secondary,
    fontSize: 9,
    marginTop: 1
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  giftCard: {
    width: '31%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 8
  },
  giftCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.12)'
  },
  giftIcon: {
    fontSize: 26,
    marginBottom: 3
  },
  giftName: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  giftPrice: {
    color: COLORS.gold,
    fontSize: 10,
    marginTop: 2
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  qtyLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginRight: 8
  },
  qtyBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  qtyBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 0, 122, 0.2)'
  },
  qtyBtnText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold'
  },
  qtyBtnTextActive: {
    color: COLORS.accent
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 6
  },
  sendBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    marginTop: 4
  },
  sendBtnDisabled: {
    opacity: 0.5
  },
  sendBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold'
  }
});
