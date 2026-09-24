import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/theme';
import { API_BASE_URL } from '../api/config';

export const ChatBox = ({ messages = [], onSendMessage, hideInputBar = false }) => {
  const [inputText, setInputText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${cleanUrl}`;
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

    // Photo message check
    const isImage = item.messageType === 'Image' || !!item.imageUrl || (typeof item.content === 'string' && item.content.startsWith('[IMG]:'));
    let imgUri = null;
    let captionText = null;

    if (isImage) {
      if (item.imageUrl) {
        imgUri = getFullImageUrl(item.imageUrl);
        captionText = item.content && item.content !== '📷 Photo' ? item.content : null;
      } else if (typeof item.content === 'string' && item.content.startsWith('[IMG]:')) {
        imgUri = getFullImageUrl(item.content.replace('[IMG]:', '').trim());
      }
    }

    if (isImage && imgUri) {
      return (
        <View style={styles.chatImageRow}>
          <View style={styles.headerInfoRow}>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>Lv.{item.userLevel || 1}</Text>
            </View>
            <Text style={styles.senderName}>{item.senderName}:</Text>
          </View>
          
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setPreviewImage({ uri: imgUri, senderName: item.senderName, caption: captionText })}
            style={styles.imageThumbnailContainer}
          >
            <Image
              source={{ uri: imgUri }}
              style={styles.imageThumbnail}
              resizeMode="cover"
            />
            <View style={styles.imageExpandBadge}>
              <Text style={styles.imageExpandIcon}>🔍</Text>
            </View>
          </TouchableOpacity>

          {!!captionText && (
            <Text style={styles.imageCaptionText}>{captionText}</Text>
          )}
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

      {/* Fullscreen Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.fullscreenModalBackdrop}>
          <TouchableOpacity
            style={styles.fullscreenCloseBtn}
            onPress={() => setPreviewImage(null)}
          >
            <Text style={styles.fullscreenCloseIcon}>✕</Text>
          </TouchableOpacity>

          {previewImage && (
            <View style={styles.fullscreenImageCard}>
              <View style={styles.fullscreenHeader}>
                <Text style={styles.fullscreenSenderText}>
                  📷 Shared by <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>{previewImage.senderName}</Text>
                </Text>
              </View>

              <Image
                source={{ uri: previewImage.uri }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />

              {!!previewImage.caption && (
                <View style={styles.fullscreenCaptionBox}>
                  <Text style={styles.fullscreenCaptionText}>{previewImage.caption}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
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
    fontWeight: '600',
    flexShrink: 1
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
  chatImageRow: {
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    maxWidth: '85%'
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
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
    marginRight: 6,
    flexShrink: 0
  },
  messageContent: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1,
    flexShrink: 1
  },
  imageThumbnailContainer: {
    width: 140,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    position: 'relative'
  },
  imageThumbnail: {
    width: '100%',
    height: '100%'
  },
  imageExpandBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  imageExpandIcon: {
    fontSize: 10,
    color: '#fff'
  },
  imageCaptionText: {
    color: '#e2e8f0',
    fontSize: 11,
    marginTop: 4
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
  },
  fullscreenModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  fullscreenCloseBtn: {
    position: 'absolute',
    top: 44,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  fullscreenCloseIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  fullscreenImageCard: {
    width: '100%',
    maxHeight: '80%',
    alignItems: 'center'
  },
  fullscreenHeader: {
    marginBottom: 10
  },
  fullscreenSenderText: {
    color: '#fff',
    fontSize: 14
  },
  fullscreenImage: {
    width: '100%',
    height: 380,
    borderRadius: 12
  },
  fullscreenCaptionBox: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: '90%'
  },
  fullscreenCaptionText: {
    color: '#f8fafc',
    fontSize: 13,
    textAlign: 'center'
  }
});
