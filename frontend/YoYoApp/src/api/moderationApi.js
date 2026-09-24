import { API_BASE_URL, parseApiResponse } from './config';

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
