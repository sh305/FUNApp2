import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, SafeAreaView } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/constants/theme';

import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RoomVoiceScreen } from './src/screens/RoomVoiceScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BlockedUsersScreen } from './src/screens/BlockedUsersScreen';

function MainNavigation() {
  const { isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'room', 'profile', 'blocked'
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeRoomPassword, setActiveRoomPassword] = useState(null);

  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const navigateToRoom = (roomId, password = null) => {
    setActiveRoomId(roomId);
    setActiveRoomPassword(password);
    setCurrentScreen('room');
  };

  const leaveRoom = () => {
    setActiveRoomId(null);
    setActiveRoomPassword(null);
    setCurrentScreen('home');
  };

  switch (currentScreen) {
    case 'room':
      return (
        <RoomVoiceScreen
          roomId={activeRoomId}
          roomPassword={activeRoomPassword}
          onLeave={leaveRoom}
        />
      );
    case 'profile':
      return (
        <ProfileScreen
          onBack={() => setCurrentScreen('home')}
          onOpenBlockedList={() => setCurrentScreen('blocked')}
        />
      );
    case 'blocked':
      return (
        <BlockedUsersScreen
          onBack={() => setCurrentScreen('profile')}
        />
      );
    case 'home':
    default:
      return (
        <HomeScreen
          onOpenRoom={navigateToRoom}
          onOpenProfile={() => setCurrentScreen('profile')}
        />
      );
  }
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />
      <AuthProvider>
        <MainNavigation />
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  }
});
