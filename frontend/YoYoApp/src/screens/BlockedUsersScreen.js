import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { AvatarWithFrame } from '../components/AvatarWithFrame';

export const BlockedUsersScreen = ({ onBack }) => {
  const { token } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadBlockedList();
  }, []);

  const loadBlockedList = async () => {
    try {
      setLoading(true);
      const data = await userApi.getBlockedList(token);
      setBlockedUsers(data);
    } catch (err) {
      console.warn('Failed to load blocked list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (targetUserId) => {
    try {
      setActionLoadingId(targetUserId);
      await userApi.unblockUser(token, targetUserId);
      setBlockedUsers(prev => prev.filter(u => u.id !== targetUserId));
      Alert.alert('Unblocked', 'User successfully unblock ho gaya hai.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Unblock error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.subtitle}>
        Jab tak aap kisi user ko yahan se unblock nahi karte, tab tak wo aapki profile visit nahi kar payenge.
      </Text>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={item => `blocked_${item.id}`}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <AvatarWithFrame
                avatarUrl={item.avatarUrl}
                frameId={item.activeFrameId || 1}
                userLevel={item.userLevel || 1}
                size={44}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>{item.displayName}</Text>
                <Text style={styles.userId}>ID: {item.username}</Text>
              </View>

              <TouchableOpacity
                style={styles.unblockBtn}
                disabled={actionLoadingId === item.id}
                onPress={() => handleUnblock(item.id)}
              >
                {actionLoadingId === item.id ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.unblockText}>Unblock</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛡️</Text>
              <Text style={styles.emptyTitle}>Koi blocked user nahi hai</Text>
              <Text style={styles.emptyDesc}>Aapki blacklist khali hai.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  backBtn: {
    padding: 6
  },
  backText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold'
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold'
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 16
  },
  listContent: {
    padding: 16,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center'
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  userName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold'
  },
  userId: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  unblockBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12
  },
  unblockText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold'
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold'
  },
  emptyDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4
  }
});
