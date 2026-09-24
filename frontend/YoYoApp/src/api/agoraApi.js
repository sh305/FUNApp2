import { API_BASE_URL } from './config';

export const agoraApi = {
  async getConfig() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agora/config`);
      if (!res.ok) throw new Error('Failed to load Agora configuration');
      return await res.json();
    } catch (err) {
      console.warn('agoraApi.getConfig error:', err);
      return { appId: '', isConfigured: false };
    }
  },

  async getToken(token, roomId, role = 1) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agora/token?roomId=${roomId}&role=${role}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to retrieve Agora RTC token');
      }
      return await res.json();
    } catch (err) {
      console.warn('agoraApi.getToken error:', err);
      throw err;
    }
  }
};
