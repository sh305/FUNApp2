import { API_BASE_URL } from './config';

export const roomApi = {
  async getRooms(category = null) {
    const url = category && category !== 'All' 
      ? `${API_BASE_URL}/api/rooms?category=${encodeURIComponent(category)}` 
      : `${API_BASE_URL}/api/rooms`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Rooms load karne me error');
    return await res.json();
  },

  async getRoomById(id) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`);
    if (!res.ok) throw new Error('Room details load karne me error');
    return await res.json();
  },

  async createRoom(token, { title, description, coverUrl, category, isLocked, password }) {
    const res = await fetch(`${API_BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, coverUrl, category, isLocked, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Room create karne me error');
    return data;
  },

  async lockRoom(token, roomId, password) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Room lock karne me error');
    return data;
  },

  async unlockRoom(token, roomId) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/unlock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Room unlock karne me error');
    return data;
  },

  async verifyPassword(roomId, password) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || 'Galat password'));
    return data;
  },

  async getRoomKicks(token, roomId) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/kicks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Kicks list load nahi hui');
    return await res.json();
  },

  async pardonKick(token, roomId, kickId) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/kicks/${kickId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unkick error');
    return data;
  },

  async claimBox(token, roomId) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/claim-box`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Box claim karne me error');
    return data;
  }
};
