import { API_BASE_URL, parseApiResponse } from './config';

export const agoraApi = {
  async getConfig() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agora/config`);
      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Failed to load Agora configuration');
      return data;
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
      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error((data && (data.message || data.error)) || 'Failed to retrieve Agora RTC token');
      }
      return data;
    } catch (err) {
      console.warn('agoraApi.getToken error:', err);
      throw err;
    }
  }
};
