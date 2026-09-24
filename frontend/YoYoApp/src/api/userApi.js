import { API_BASE_URL, parseApiResponse } from './config';

export const userApi = {
  async getMe(token) {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Failed to get current user');
    return data;
  },

  async getUserProfile(token, targetUserId) {
    const res = await fetch(`${API_BASE_URL}/api/users/${targetUserId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (res.status === 403) {
      return { isBlocked: true, message: (data && (data.message || data.error)) || 'Forbidden' };
    }
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Failed to get user profile');
    return { isBlocked: false, ...data };
  },

  async blockUser(token, targetUserId) {
    const res = await fetch(`${API_BASE_URL}/api/users/${targetUserId}/block`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Block failed');
    return data;
  },

  async unblockUser(token, targetUserId) {
    const res = await fetch(`${API_BASE_URL}/api/users/${targetUserId}/block`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Unblock failed');
    return data;
  },

  async getBlockedList(token) {
    const res = await fetch(`${API_BASE_URL}/api/users/blocked-list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Blocked list load error');
    return data;
  },

  async getFrames(token) {
    const res = await fetch(`${API_BASE_URL}/api/users/frames`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Frames load error');
    return data;
  },

  async selectFrame(token, frameId) {
    const res = await fetch(`${API_BASE_URL}/api/users/frames/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ frameId })
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Frame selection failed');
    return data;
  }
};
