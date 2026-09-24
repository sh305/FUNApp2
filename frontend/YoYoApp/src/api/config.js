import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Live Production API hosted on Render
export const CLOUD_API_URL = 'https://funapp-api-7uiz.onrender.com';

// Local Fallback (if testing locally)
const hostUri = Constants.expoConfig?.hostUri 
  || Constants.manifest2?.extra?.expoClient?.hostUri 
  || Constants.manifest?.debuggerHost 
  || '';

const extractedIp = hostUri ? hostUri.split(':')[0] : null;
const LOCAL_MACHINE_IP = '192.168.0.14';
const targetIp = extractedIp || LOCAL_MACHINE_IP;
const isWeb = Platform.OS === 'web';

const LOCAL_API_URL = isWeb
  ? (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `http://${window.location.hostname}:5000`
      : 'http://localhost:5000')
  : `http://${targetIp}:5000`;

// By default use the Live Cloud API (Set to false only if you want local-only testing)
const USE_CLOUD_API = true;

export const API_BASE_URL = USE_CLOUD_API ? CLOUD_API_URL : LOCAL_API_URL;

export async function fetchWithTimeout(url, options = {}, timeoutMs = 25000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Server connection timeout ho gaya. Dubara koshish karein.'));
    }, timeoutMs);
  });

  try {
    const res = await Promise.race([
      fetch(url, options),
      timeoutPromise
    ]);
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

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

