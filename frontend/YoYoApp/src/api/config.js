import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get LAN IP dynamically from Expo Host or fallback to this PC's local Wi-Fi IP
const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
const lanIp = hostUri ? hostUri.split(':')[0] : '192.168.1.4';

export const API_BASE_URL = Platform.OS === 'web' 
  ? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? `http://${window.location.hostname}:5000` 
      : 'http://localhost:5000')
  : `http://${lanIp}:5000`;

export const HUB_URL = `${API_BASE_URL}/hubs/room`;
