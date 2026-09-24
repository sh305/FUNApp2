import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native';

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '👏', '🎉', '🌹', '🥳', '👑', '💯', '🤩', '😘', '🙏'];

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹',
      '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
      '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐',
      '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟',
      '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😮‍💨',
      '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
      '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🫢', '🫡', '🤫',
      '🫠', '🤥', '😶', '😐', '😑', '😬', '🤤', '😴', '🥱', '😵',
      '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠',
      '😈', '👿', '🤡', '💩', '👻', '💀', '☠️', '👽', '🤖', '🎃'
    ]
  },
  {
    id: 'love',
    name: 'Love & Hearts',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
      '💟', '💋', '💌', '💐', '🌹', '🥀', '🌺', '🌸', '🌷', '🌻',
      '🪷', '🌼', '🍀', '✨', '⭐', '🌟', '💫', '💍', '💎', '👑'
    ]
  },
  {
    id: 'gestures',
    name: 'Hands',
    icon: '👍',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '🫵',
      '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐',
      '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👀'
    ]
  },
  {
    id: 'vibes',
    name: 'Party & Vibes',
    icon: '🔥',
    emojis: [
      '🔥', '💯', '🎉', '🎊', '🍾', '🥂', '🍻', '🍺', '🍹', '🍸',
      '🍷', '💃', '🕺', '🏆', '🥇', '🥈', '🥉', '🎯', '🚀', '🛸',
      '🎮', '🕹️', '🎲', '🎰', '🎤', '🎧', '🎼', '🎵', '🎶', '🎸',
      '🎹', '🥁', '🎷', '🎺', '🎻', '🎭', '🎬', '📸', '💰', '💵'
    ]
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦁',
    emojis: [
      '🦁', '🐯', '🐻', '🐼', '🐨', '🐵', '🐒', '🦍', '🦧', '🐶',
      '🐕', '🐺', '🦊', '🦝', '🐱', '🐈', '🐆', '🐅', '🦄', '🐴',
      '🐮', '🐷', '🐗', '🐭', '🐹', '🐰', '🐇', '🐿️', '🦔', '🦇',
      '🦅', '🦉', '🦜', '🕊️', '🦚', '🦋', '🐝', '🐞', '🐢', '🐍',
      '🦎', '🐙', '🐬', '🐳', '🦈', '🐊', '🐉', '🦖', '🦕', '🌸'
    ]
  },
  {
    id: 'food',
    name: 'Food & Fun',
    icon: '🍕',
    emojis: [
      '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🎂', '🍰', '🧁', '🍫',
      '🍬', '🍭', '🍦', '🍧', '🍨', '🍓', '🍒', '🍎', '🍉', '🍇',
      '☕', '🧋', '🍵', '🥤', '🍼', '🍻', '🍷', '🥂', '🍾', '🍪'
    ]
  }
];

export const EmojiPickerModal = ({ visible, onClose, onSendEmoji }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [selectedCatId, setSelectedCatId] = useState('smileys');
  const [selectedString, setSelectedString] = useState('');
  const [directSendMode, setDirectSendMode] = useState(true); // Default true: 1-tap direct send!
  const [sentToast, setSentToast] = useState('');

  const activeCategory = EMOJI_CATEGORIES.find(c => c.id === selectedCatId) || EMOJI_CATEGORIES[0];

  const triggerSentFeedback = (emoji) => {
    setSentToast(`Sent ${emoji} !`);
    setTimeout(() => {
      setSentToast('');
    }, 1200);
  };

  const handleEmojiPress = (emoji) => {
    if (directSendMode) {
      // 1-Tap Direct Send to room chat!
      onSendEmoji(emoji);
      triggerSentFeedback(emoji);
    } else {
      // Multi-select / chain mode
      setSelectedString(prev => prev + emoji);
    }
  };

  const handleQuickSend = (emoji) => {
    onSendEmoji(emoji);
    triggerSentFeedback(emoji);
  };

  const handleSendCombined = () => {
    if (selectedString.trim()) {
      onSendEmoji(selectedString.trim());
      triggerSentFeedback(selectedString.trim());
      setSelectedString('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          style={[styles.sheetCard, { maxWidth: Math.min(windowWidth, 480) }]}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>😊 Phone Emojis</Text>
              <Text style={styles.headerSubtitle}>
                {directSendMode ? '⚡ Tap any emoji to send directly' : '✍️ Tap emojis to combine, then hit Send'}
              </Text>
            </View>

            <View style={styles.headerRight}>
              {/* Direct Send Mode Toggle Pill */}
              <TouchableOpacity
                style={[styles.modeTogglePill, directSendMode && styles.modeTogglePillActive]}
                onPress={() => setDirectSendMode(prev => !prev)}
              >
                <Text style={styles.modeToggleText}>
                  {directSendMode ? '⚡ 1-Tap Send' : '✍️ Combine'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Instant Send Row (Favorites) */}
          <View style={styles.quickBar}>
            <Text style={styles.quickBarLabel}>Popular:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickList}>
              {QUICK_EMOJIS.map((emoji, i) => (
                <TouchableOpacity
                  key={`quick_${i}_${emoji}`}
                  style={styles.quickEmojiBtn}
                  onPress={() => handleQuickSend(emoji)}
                >
                  <Text style={styles.quickEmojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Categories Tab Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {EMOJI_CATEGORIES.map(cat => {
              const isSelected = cat.id === selectedCatId;
              return (
                <TouchableOpacity
                  key={`cat_${cat.id}`}
                  style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                  onPress={() => setSelectedCatId(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryName, isSelected && styles.categoryNameActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sent Toast Feedback */}
          {!!sentToast && (
            <View style={styles.toastBanner}>
              <Text style={styles.toastText}>{sentToast}</Text>
            </View>
          )}

          {/* Emojis Grid */}
          <ScrollView
            style={styles.emojisScroll}
            contentContainerStyle={styles.emojisGrid}
            showsVerticalScrollIndicator={false}
          >
            {activeCategory.emojis.map((emoji, idx) => (
              <TouchableOpacity
                key={`emoji_${idx}_${emoji}`}
                style={styles.emojiCell}
                activeOpacity={0.6}
                onPress={() => handleEmojiPress(emoji)}
                onLongPress={() => {
                  // Direct send on long-press always
                  handleQuickSend(emoji);
                }}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Combine / Multi-select Action Bar (Shown when not in 1-tap mode or when string has text) */}
          {(!directSendMode || selectedString.length > 0) && (
            <View style={styles.actionFooter}>
              <View style={styles.previewBox}>
                <Text style={styles.previewText} numberOfLines={1}>
                  {selectedString ? selectedString : 'Tap emojis to add...'}
                </Text>
                {selectedString.length > 0 && (
                  <TouchableOpacity onPress={() => setSelectedString('')} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.sendBtn, !selectedString && styles.sendBtnDisabled]}
                disabled={!selectedString}
                onPress={handleSendCombined}
              >
                <Text style={styles.sendBtnText}>Send ➤</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 15, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sheetCard: {
    width: '100%',
    backgroundColor: '#150d2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(168, 85, 247, 0.35)',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 22,
    maxHeight: 400,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4
  },
  headerLeft: {
    gap: 2
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff'
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  modeTogglePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  modeTogglePillActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#c084fc'
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e2e8f0'
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8
  },
  quickBarLabel: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 6
  },
  quickList: {
    alignItems: 'center',
    gap: 4
  },
  quickEmojiBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  quickEmojiText: {
    fontSize: 20
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 8
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4
  },
  categoryTabActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.35)',
    borderColor: '#c084fc'
  },
  categoryIcon: {
    fontSize: 14
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)'
  },
  categoryNameActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  toastBanner: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'center',
    marginBottom: 6
  },
  toastText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  },
  emojisScroll: {
    maxHeight: 180
  },
  emojisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingVertical: 4
  },
  emojiCell: {
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  emojiText: {
    fontSize: 24
  },
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  previewBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 38
  },
  previewText: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1
  },
  clearBtn: {
    padding: 2,
    marginLeft: 6
  },
  clearBtnText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12
  },
  sendBtn: {
    backgroundColor: '#9333ea',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  sendBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13
  }
});
