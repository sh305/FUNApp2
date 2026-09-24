import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export const AuthScreen = () => {
  const { phoneLogin, googleLogin, facebookLogin, guestLogin, banError } = useAuth();
  const [activeTab, setActiveTab] = useState('phone'); // 'phone', 'google', 'facebook', 'guest'

  // Phone Form
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [displayName, setDisplayName] = useState('');

  // Google Form
  const [googleEmail, setGoogleEmail] = useState('priya@gmail.com');
  const [googleName, setGoogleName] = useState('Priya Sharma 🎵');

  // Facebook Form
  const [fbId, setFbId] = useState('fb_102030');
  const [fbName, setFbName] = useState('Rahul DJ 🔥');

  // Guest Form
  const [guestName, setGuestName] = useState('Royal King 👑');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) {
      setErrorMsg('Mobile number enter karein.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      await phoneLogin(phone.trim(), otp.trim(), displayName.trim() || null);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    if (!googleEmail.trim()) {
      setErrorMsg('Google email enter karein.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      await googleLogin(googleEmail.trim(), googleName.trim(), 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
    } catch (err) {
      setErrorMsg(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSubmit = async () => {
    if (!fbId.trim()) {
      setErrorMsg('Facebook ID enter karein.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      await facebookLogin(fbId.trim(), fbName.trim(), 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150');
    } catch (err) {
      setErrorMsg(err.message || 'Facebook Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await guestLogin(guestName.trim() || null);
    } catch (err) {
      setErrorMsg(err.message || 'Guest Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Text style={styles.brandLogo}>🎙️ YoYo</Text>
          <Text style={styles.brandTagline}>Live Voice Chat & Social Rooms</Text>
        </View>

        {/* Ban Alert if user ID is banned */}
        {banError && (
          <View style={styles.banAlertBox}>
            <Text style={styles.banAlertIcon}>🚫</Text>
            <View style={styles.banAlertTextCol}>
              <Text style={styles.banAlertTitle}>Access Restricted (Banned)</Text>
              <Text style={styles.banAlertMsg}>{banError}</Text>
            </View>
          </View>
        )}

        {/* Login Method Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'phone' && styles.tabItemActive]}
            onPress={() => { setActiveTab('phone'); setErrorMsg(''); }}
          >
            <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>
              📱 Phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'google' && styles.tabItemActive]}
            onPress={() => { setActiveTab('google'); setErrorMsg(''); }}
          >
            <Text style={[styles.tabText, activeTab === 'google' && styles.tabTextActive]}>
              🌐 Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'facebook' && styles.tabItemActive]}
            onPress={() => { setActiveTab('facebook'); setErrorMsg(''); }}
          >
            <Text style={[styles.tabText, activeTab === 'facebook' && styles.tabTextActive]}>
              📘 Facebook
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'guest' && styles.tabItemActive]}
            onPress={() => { setActiveTab('guest'); setErrorMsg(''); }}
          >
            <Text style={[styles.tabText, activeTab === 'guest' && styles.tabTextActive]}>
              🚀 Guest
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Body */}
        <View style={styles.card}>
          {activeTab === 'phone' && (
            <View>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9876543210"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.inputLabel}>OTP Code (Default: 123456)</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
              />

              <Text style={styles.inputLabel}>Display Name (Optional for new user)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Shivam Rai"
                placeholderTextColor={COLORS.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                disabled={loading}
                onPress={handlePhoneSubmit}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Login with Phone</Text>}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'google' && (
            <View>
              <Text style={styles.inputLabel}>Google Email</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. user@gmail.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={googleEmail}
                onChangeText={setGoogleEmail}
              />

              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={COLORS.textMuted}
                value={googleName}
                onChangeText={setGoogleName}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                disabled={loading}
                onPress={handleGoogleSubmit}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Sign In with Google</Text>}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'facebook' && (
            <View>
              <Text style={styles.inputLabel}>Facebook ID / Username</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. fb_user_123"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                value={fbId}
                onChangeText={setFbId}
              />

              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Beats"
                placeholderTextColor={COLORS.textMuted}
                value={fbName}
                onChangeText={setFbName}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                disabled={loading}
                onPress={handleFacebookSubmit}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Sign In with Facebook</Text>}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'guest' && (
            <View>
              <Text style={styles.inputLabel}>Choose Guest Nickname</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Royal King 👑"
                placeholderTextColor={COLORS.textMuted}
                value={guestName}
                onChangeText={setGuestName}
              />

              <Text style={styles.hintText}>
                ✨ 5,000 Free Welcome Coins milenge turant chat & gifts test karne ke liye!
              </Text>

              <TouchableOpacity
                style={styles.submitBtn}
                disabled={loading}
                onPress={handleGuestSubmit}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Start Quick Guest Demo</Text>}
              </TouchableOpacity>
            </View>
          )}

          {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%'
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 26
  },
  brandLogo: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.gold,
    letterSpacing: 1
  },
  brandTagline: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4
  },
  banAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  },
  banAlertIcon: {
    fontSize: 28,
    marginRight: 10
  },
  banAlertTextCol: {
    flex: 1
  },
  banAlertTitle: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2
  },
  banAlertMsg: {
    color: COLORS.text,
    fontSize: 12
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  tabItemActive: {
    backgroundColor: COLORS.primary
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    fontSize: 14
  },
  hintText: {
    color: COLORS.gold,
    fontSize: 12,
    marginVertical: 12,
    textAlign: 'center'
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6
  },
  submitBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold'
  },
  errorMsg: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center'
  }
});
