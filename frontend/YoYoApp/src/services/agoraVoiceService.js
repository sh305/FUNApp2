import { Platform } from 'react-native';

class AgoraVoiceService {
  constructor() {
    this.engine = null;
    this.isInitialized = false;
    this.isInChannel = false;
    this.isMuted = false;
    this.isBroadcaster = false;
    this.currentChannel = null;
    this.currentUid = 0;
    this.listeners = new Map();
    this.nativeAvailable = false;
  }

  // Check and dynamically load native Agora engine if available
  _getNativeModule() {
    if (Platform.OS === 'web') return null;
    try {
      // Dynamic require to prevent crash inside standard Expo Go
      const Agora = require('react-native-agora');
      return Agora;
    } catch {
      return null;
    }
  }

  async init(appId) {
    if (!appId || appId === 'YOUR_AGORA_APP_ID') {
      console.log('[AgoraVoice] No valid Agora App ID configured yet.');
      return false;
    }

    try {
      const Agora = this._getNativeModule();
      if (!Agora || !Agora.createAgoraRtcEngine) {
        console.log('[AgoraVoice] Native Agora module not loaded in current environment (requires APK or Dev Client).');
        this.nativeAvailable = false;
        return false;
      }

      this.engine = Agora.createAgoraRtcEngine();
      this.engine.initialize({
        appId: appId,
        channelProfile: Agora.ChannelProfileType?.ChannelProfileLiveBroadcasting || 1
      });

      // Enable audio and volume indication
      this.engine.enableAudio();
      this.engine.enableAudioVolumeIndication(200, 3, true);

      // Register internal event handlers
      this.engine.registerEventHandler({
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log('[AgoraVoice] Joined channel successfully:', connection.channelId);
          this.isInChannel = true;
          this._emit('onJoinSuccess', { channel: connection.channelId, elapsed });
        },
        onUserJoined: (connection, remoteUid, elapsed) => {
          console.log('[AgoraVoice] Remote user joined audio:', remoteUid);
          this._emit('onUserJoined', { uid: remoteUid, elapsed });
        },
        onUserOffline: (connection, remoteUid, reason) => {
          console.log('[AgoraVoice] Remote user offline:', remoteUid);
          this._emit('onUserOffline', { uid: remoteUid, reason });
        },
        onAudioVolumeIndication: (connection, speakers, totalVolume) => {
          this._emit('onAudioVolumeIndication', { speakers, totalVolume });
        },
        onError: (err, msg) => {
          console.warn('[AgoraVoice] Error:', err, msg);
          this._emit('onError', { err, msg });
        }
      });

      this.isInitialized = true;
      this.nativeAvailable = true;
      return true;
    } catch (err) {
      console.warn('[AgoraVoice] Failed to initialize Agora RTC engine:', err);
      this.nativeAvailable = false;
      return false;
    }
  }

  async joinChannel({ appId, channelName, token, uid, isBroadcaster = false }) {
    this.currentChannel = channelName;
    this.currentUid = uid;
    this.isBroadcaster = isBroadcaster;

    if (!this.isInitialized) {
      const ok = await this.init(appId);
      if (!ok) {
        console.log('[AgoraVoice] Channel join queued or simulation mode active for channel:', channelName);
        this.isInChannel = true;
        return;
      }
    }

    try {
      const Agora = this._getNativeModule();
      if (!Agora || !this.engine) return;

      const role = isBroadcaster 
        ? (Agora.ClientRoleType?.ClientRoleBroadcaster || 1)
        : (Agora.ClientRoleType?.ClientRoleAudience || 2);

      this.engine.setClientRoleType(role);

      // Join Channel
      this.engine.joinChannel(
        token || '',
        channelName,
        uid,
        {
          clientRoleType: role,
          publishMicrophoneTrack: isBroadcaster,
          autoSubscribeAudio: true
        }
      );
      this.isInChannel = true;
      console.log(`[AgoraVoice] Channel joined as ${isBroadcaster ? 'Broadcaster' : 'Audience'}`);
    } catch (err) {
      console.warn('[AgoraVoice] Error joining channel:', err);
    }
  }

  async setRole(isBroadcaster) {
    this.isBroadcaster = isBroadcaster;
    if (!this.engine || !this.nativeAvailable) return;

    try {
      const Agora = this._getNativeModule();
      if (!Agora) return;

      const role = isBroadcaster 
        ? (Agora.ClientRoleType?.ClientRoleBroadcaster || 1)
        : (Agora.ClientRoleType?.ClientRoleAudience || 2);

      this.engine.setClientRoleType(role);
      if (isBroadcaster) {
        this.engine.muteLocalAudioStream(false);
        this.isMuted = false;
      } else {
        this.engine.muteLocalAudioStream(true);
        this.isMuted = true;
      }
      console.log(`[AgoraVoice] Role switched to: ${isBroadcaster ? 'Broadcaster (Mic ON)' : 'Audience (Mic OFF)'}`);
    } catch (err) {
      console.warn('[AgoraVoice] Error changing role:', err);
    }
  }

  async toggleMute() {
    if (!this.engine || !this.nativeAvailable) {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }

    try {
      this.isMuted = !this.isMuted;
      this.engine.muteLocalAudioStream(this.isMuted);
      console.log('[AgoraVoice] Local mic muted:', this.isMuted);
      return this.isMuted;
    } catch (err) {
      console.warn('[AgoraVoice] Error toggling mute:', err);
      return this.isMuted;
    }
  }

  async leaveChannel() {
    if (this.engine && this.nativeAvailable) {
      try {
        this.engine.leaveChannel();
        console.log('[AgoraVoice] Left channel');
      } catch (err) {
        console.warn('[AgoraVoice] Error leaving channel:', err);
      }
    }
    this.isInChannel = false;
    this.isBroadcaster = false;
    this.currentChannel = null;
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  _emit(event, data) {
    if (this.listeners.has(event)) {
      for (const handler of this.listeners.get(event)) {
        try {
          handler(data);
        } catch (e) {
          console.error('[AgoraVoice] Listener error:', e);
        }
      }
    }
  }
}

export const agoraVoiceService = new AgoraVoiceService();
