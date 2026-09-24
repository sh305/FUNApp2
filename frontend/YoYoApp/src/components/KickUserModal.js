import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/theme';

export const KickUserModal = ({
  visible,
  onClose,
  targetUser,
  onConfirmKick
}) => {
  const [kickType, setKickType] = useState('ThreeDays'); // 'ThreeDays' or 'Permanent'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!targetUser) return null;

  const handleKick = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await onConfirmKick(targetUser.id, kickType);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Kick karne me error aayi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.icon}>👢</Text>
          <Text style={styles.title}>Kick User from Room</Text>
          <Text style={styles.targetName}>
            User: <Text style={styles.highlight}>{targetUser.displayName}</Text>
          </Text>

          <Text style={styles.subtitle}>
            Kick duration select karein:
          </Text>

          {/* Option 1: 3 Days */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              kickType === 'ThreeDays' && styles.optionCardActive
            ]}
            onPress={() => setKickType('ThreeDays')}
          >
            <View style={styles.radioCircle}>
              {kickType === 'ThreeDays' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.optionDetails}>
              <Text style={styles.optionTitle}>3 Days Kick</Text>
              <Text style={styles.optionDesc}>
                User 3 dino tak is room me wapas nahi aa payega. 3 din baad auto unlock ho jayega.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Permanent */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              kickType === 'Permanent' && styles.optionCardActive
            ]}
            onPress={() => setKickType('Permanent')}
          >
            <View style={styles.radioCircle}>
              {kickType === 'Permanent' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.optionDetails}>
              <Text style={styles.optionTitle}>Permanent Kick</Text>
              <Text style={styles.optionDesc}>
                Jab tak aap (Room Owner) blacklist se is user ko pardon/un-kick nahi karte, yeh room me kabhi nahi aa payega.
              </Text>
            </View>
          </TouchableOpacity>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setErrorMsg('');
                onClose();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.kickBtn}
              disabled={loading}
              onPress={handleKick}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.kickBtnText}>Confirm Kick</Text>
              )}
            </TouchableOpacity>
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
    padding: 22,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  icon: {
    fontSize: 36,
    marginBottom: 8
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  targetName: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 14
  },
  highlight: {
    color: COLORS.accent,
    fontWeight: 'bold'
  },
  subtitle: {
    alignSelf: 'flex-start',
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    width: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    marginBottom: 10
  },
  optionCardActive: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.danger
  },
  optionDetails: {
    flex: 1
  },
  optionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2
  },
  optionDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 15
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 6
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  kickBtn: {
    flex: 1,
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8
  },
  kickBtnText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});
