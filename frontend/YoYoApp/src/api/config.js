import { Platform } from 'react-native';
import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri 
  || Constants.manifest2?.extra?.expoClient?.hostUri 
  || Constants.manifest?.debuggerHost 
  || '';

const extractedIp = hostUri ? hostUri.split(':')[0] : null;

// User's current local Wi-Fi IP as fallback
const LOCAL_MACHINE_IP = '192.168.0.14';
const targetIp = extractedIp || LOCAL_MACHINE_IP;

const isWeb = Platform.OS === 'web';

export const API_BASE_URL = isWeb
  ? (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `http://${window.location.hostname}:5000`
      : 'http://localhost:5000')
  : `http://${targetIp}:5000`;

export async function parseApiResponse(res) {
  const text = await res.text();
  if (!text || !text.trim()) return null;

  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const contentType = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
    if (contentType.includes('application/json')) {
      throw new Error(`Invalid JSON response from server: ${trimmed.slice(0, 200)}`);
    }

    throw new Error(trimmed.slice(0, 200));
  }
}

export const HUB_URL = `${API_BASE_URL}/hubs/room`;
