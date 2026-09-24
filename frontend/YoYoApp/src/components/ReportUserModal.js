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

export const ReportUserModal = ({
  visible,
  onClose,
  targetUser,
  onSubmitReport
}) => {
  const [durationType, setDurationType] = useState('ThreeDays'); // 'ThreeDays', 'SevenDays', 'Permanent'
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!targetUser) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setErrorMsg('Report ka reason likhna zaroori hai.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await onSubmitReport({
        reportedUserId: targetUser.id,
        reason: reason.trim(),
        durationType
      });
      setReason('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Report submit karne me error');
    } finally {
      setLoading(false);
    }
  };

  const durations = [
    {
      key: 'ThreeDays',
      label: '3 Days Ban',
      desc: 'User 3 dino tak application login/access nahi kar payega.'
    },
    {
      key: 'SevenDays',
      label: '7 Days Ban',
      desc: 'User 7 dino tak application se ban rahega.'
    },
    {
      key: 'Permanent',
      label: 'Permanent Ban',
      desc: 'User dubara kabhi apni is ID se application par nahi aa payega.'
    }
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Report User</Text>
          <Text style={styles.targetName}>
            Report target: <Text style={styles.highlight}>{targetUser.displayName}</Text>
          </Text>

          <Text style={styles.sectionLabel}>Action / Ban Duration:</Text>
          {durations.map(d => {
            const isSelected = durationType === d.key;
            return (
              <TouchableOpacity
                key={d.key}
                style={[styles.durationCard, isSelected && styles.durationCardActive]}
                onPress={() => setDurationType(d.key)}
              >
                <View style={styles.radio}>
                  {isSelected && <View style={styles.radioChecked} />}
                </View>
                <View style={styles.durationInfo}>
                  <Text style={[styles.durationLabel, d.key === 'Permanent' && styles.dangerLabel]}>
                    {d.label}
                  </Text>
                  <Text style={styles.durationDesc}>{d.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.sectionLabel}>Reason for Report:</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Kripya report karne ka kaaran batayein (e.g. Abusive behavior, fake ID)"
            placeholderTextColor={COLORS.textMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={2}
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setReason('');
                setErrorMsg('');
                onClose();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              disabled={loading}
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>Submit Report</Text>
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
    maxWidth: 390,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  icon: {
    fontSize: 34,
    alignSelf: 'center',
    marginBottom: 6
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4
  },
  targetName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14
  },
  highlight: {
    color: COLORS.accent,
    fontWeight: 'bold'
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    marginBottom: 8
  },
  durationCardActive: {
    borderColor: COLORS.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.12)'
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  radioChecked: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning
  },
  durationInfo: {
    flex: 1
  },
  durationLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold'
  },
  dangerLabel: {
    color: COLORS.danger
  },
  durationDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1
  },
  reasonInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    fontSize: 13,
    textAlignVertical: 'top',
    height: 60,
    marginBottom: 10
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center'
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
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
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.warning,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8
  },
  submitText: {
    color: '#000',
    fontWeight: 'bold'
  }
});
