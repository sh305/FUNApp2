import { API_BASE_URL } from './config';

export const userApi = {
  async getMe(token) {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to get current user');
    return await res.json();
  },

  async getUserProfile(token, targetUserId) {
    const res = await fetch(`${API_BASE_URL}/api/users/${targetUserId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.status === 403) {
      return { isBlocked: true, message: data.message };
    }
    if (!res.ok) throw new Error(data.message || 'Failed to get user profile');
    return { isBlocked: false, ...data };
  },

  async blockUser(token, targetUserId) {
    const res = await fetch(`${API_BASE_URL}/api/users/${targetUserId}/block`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Block failed');
    return data;
  },

  async unblockUser(token, targetUserId) {
    const res = await fetch(`${API_BASE_URL}/api/users/${targetUserId}/block`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unblock failed');
    return data;
  },

  async getBlockedList(token) {
    const res = await fetch(`${API_BASE_URL}/api/users/blocked-list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Blocked list load error');
    return await res.json();
  },

  async getFrames(token) {
    const res = await fetch(`${API_BASE_URL}/api/users/frames`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Frames load error');
    return await res.json();
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Frame selection failed');
    return data;
  }
};
