import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/theme';

export const LockRoomModal = ({
  visible,
  onClose,
  isCurrentlyLocked,
  isOwner,
  onToggleLock,
  onVerifyPassword
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAction = async () => {
    if (!password.trim()) {
      setErrorMsg('Password/PIN enter karna zaroori hai.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      if (isOwner) {
        // Owner locking or changing lock password
        await onToggleLock(!isCurrentlyLocked, password.trim());
      } else {
        // Guest entering locked room
        await onVerifyPassword(password.trim());
      }
      setPassword('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await onToggleLock(false, null);
      setPassword('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Unlock error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.modalIcon}>{isCurrentlyLocked ? '🔒' : '🔓'}</Text>

          <Text style={styles.title}>
            {isOwner
              ? (isCurrentlyLocked ? 'Room Settings: Locked' : 'Lock Room with Password')
              : 'Room is Locked'}
          </Text>

          <Text style={styles.subtitle}>
            {isOwner
              ? 'Password set karein taki anjaan log room me enter na ho sakein.'
              : 'Is room me enter hone ke liye sahi password enter karein.'}
          </Text>

          {(!isOwner || !isCurrentlyLocked) && (
            <TextInput
              style={styles.input}
              placeholder="Enter Room Password / PIN"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              maxLength={20}
            />
          )}

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setPassword('');
                setErrorMsg('');
                onClose();
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            {isOwner && isCurrentlyLocked ? (
              <TouchableOpacity
                style={styles.unlockBtn}
                disabled={loading}
                onPress={handleUnlock}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Unlock Room</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionBtn}
                disabled={loading}
                onPress={handleAction}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.actionBtnText}>
                    {isOwner ? 'Lock Room' : 'Join Room'}
                  </Text>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 10
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    textAlign: 'center'
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8
  },
  unlockBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});
