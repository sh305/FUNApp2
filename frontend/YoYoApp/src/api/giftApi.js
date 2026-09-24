import { API_BASE_URL, parseApiResponse } from './config';

export const giftApi = {
  async getGifts(token) {
    const res = await fetch(`${API_BASE_URL}/api/gifts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Gifts load error');
    return data;
  },

  async sendGift(token, { roomId, receiverUserId, giftId, quantity = 1 }) {
    const res = await fetch(`${API_BASE_URL}/api/gifts/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ roomId, receiverUserId, giftId, quantity })
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Gift send error');
    return data;
  }
};

export const moderationApi = {
  async reportUser(token, { reportedUserId, reason, durationType }) {
    const res = await fetch(`${API_BASE_URL}/api/moderation/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reportedUserId, reason, durationType })
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Report submission error');
    return data;
  }
};
