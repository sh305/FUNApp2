import { API_BASE_URL, parseApiResponse } from './config';

export const roomApi = {
  async getRooms(category = null) {
    const url = category && category !== 'All' 
      ? `${API_BASE_URL}/api/rooms?category=${encodeURIComponent(category)}` 
      : `${API_BASE_URL}/api/rooms`;
    const res = await fetch(url);
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Rooms load karne me error');
    return data;
  },

  async getRoomById(id) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`);
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Room details load karne me error');
    return data;
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
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Room create karne me error');
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
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Room lock karne me error');
    return data;
  },

  async unlockRoom(token, roomId) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/unlock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Room unlock karne me error');
    return data;
  },

  async verifyPassword(roomId, password) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(typeof data === 'string' ? data : ((data && (data.message || data.error)) || 'Galat password'));
    return data;
  },

  async getRoomKicks(token, roomId) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/kicks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Kicks list load nahi hui');
    return data;
  },

  async pardonKick(token, roomId, kickId) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/kicks/${kickId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Unkick error');
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
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Box claim karne me error');
    return data;
  },

  async uploadRoomPhoto(token, roomId, base64Data, caption = '') {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/upload-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ base64Data, caption })
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Photo upload karne me error aayi');
    return data;
  }
};
