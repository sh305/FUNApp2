import { API_BASE_URL } from './config';

export const giftApi = {
  async getGifts(token) {
    const res = await fetch(`${API_BASE_URL}/api/gifts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gifts load error');
    return await res.json();
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gift send error');
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Report submission error');
    return data;
  }
};
