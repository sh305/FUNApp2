import { API_BASE_URL } from './config';

export const authApi = {
  async phoneLogin(phoneNumber, otpCode = '123456', displayName = null) {
    const res = await fetch(`${API_BASE_URL}/api/auth/phone-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otpCode, displayName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async googleLogin(email, displayName, avatarUrl = null, socialId = 'google_uid') {
    const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'Google', socialId, email, displayName, avatarUrl })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google Login failed');
    return data;
  },

  async facebookLogin(socialId, displayName, avatarUrl = null) {
    const res = await fetch(`${API_BASE_URL}/api/auth/facebook-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'Facebook', socialId, displayName, avatarUrl })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Facebook Login failed');
    return data;
  },

  async guestLogin(preferredName = null) {
    const res = await fetch(`${API_BASE_URL}/api/auth/guest-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Guest Login failed');
    return data;
  }
};
