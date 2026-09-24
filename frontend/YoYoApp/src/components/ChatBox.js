import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native';
import { COLORS } from '../constants/theme';

export const ChatBox = ({ messages = [], onSendMessage, hideInputBar = false }) => {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const renderItem = ({ item }) => {
    if (item.isGiftAlert) {
      return (
        <View style={styles.giftAlertBubble}>
          <Text style={styles.giftAlertText}>
            🎁 <Text style={styles.giftSender}>{item.senderName}</Text> sent{' '}
            <Text style={styles.giftHighlight}>{item.giftName}</Text> to{' '}
            <Text style={styles.giftReceiver}>{item.receiverName}</Text>! ✨
          </Text>
        </View>
      );
    }

    if (item.isSystemNotice) {
      return (
        <View style={styles.systemNoticeBubble}>
          <Text style={styles.systemNoticeText}>📢 {item.content}</Text>
        </View>
      );
    }

    return (
      <View style={styles.chatMessageRow}>
        <View style={styles.levelPill}>
          <Text style={styles.levelPillText}>Lv.{item.userLevel || 1}</Text>
        </View>
        <Text style={styles.senderName}>{item.senderName}:</Text>
        <Text style={styles.messageContent}>{item.content}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Pinned Community Safety Notice from YoYo Screenshot */}
      <View style={styles.safetyNoticeCard}>
        <Text style={styles.safetyNoticeText}>
          सेक्सुअल और हिंसक कंटेंट की अनुमति नहीं है. सभी उल्लंघन करने वालों को चैटरूम से बैन कर दिया जाएगा. कृपया एक दूसरे का सम्मान करें और अपनी पर्सनल जानकारी को उजागर न करें.
        </Text>
      </View>

      {/* Messages FlatList */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id ? `msg_${item.id}_${index}` : `msg_${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Bar */}
      {!hideInputBar && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="कमेंट लिखिए..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim()}
            onPress={handleSend}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(11, 13, 25, 0.75)',
    borderRadius: 14,
    marginHorizontal: 4,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 6
  },
  safetyNoticeCard: {
    backgroundColor: 'rgba(12, 18, 38, 0.92)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 4
  },
  safetyNoticeText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#38bdf8',
    fontWeight: '600'
  },
  messagesList: {
    paddingVertical: 2
  },
  chatMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8
  },
  levelPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginRight: 6
  },
  levelPillText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold'
  },
  senderName: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6
  },
  messageContent: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1
  },
  giftAlertBubble: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 6
  },
  giftAlertText: {
    color: COLORS.text,
    fontSize: 11
  },
  giftSender: {
    color: COLORS.gold,
    fontWeight: 'bold'
  },
  giftHighlight: {
    color: COLORS.accent,
    fontWeight: 'bold'
  },
  giftReceiver: {
    color: COLORS.secondary,
    fontWeight: 'bold'
  },
  systemNoticeBubble: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6
  },
  systemNoticeText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '500'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  input: {
    flex: 1,
    height: 38,
    color: COLORS.text,
    fontSize: 13
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  },
  sendBtnDisabled: {
    opacity: 0.4
  },
  sendIcon: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold'
  }
});
