import * as signalR from '@microsoft/signalr';
import { HUB_URL } from '../api/config';

class RoomHubService {
  constructor() {
    this.connection = null;
    this.callbacks = {};
  }

  async connect(token) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Register Hub Events
    const events = [
      'JoinedRoomSuccess',
      'UserJoinedRoom',
      'UserLeftRoom',
      'SeatOccupied',
      'SeatVacated',
      'ReceiveGiftAlert',
      'SeatCountExpanded',
      'RoomLockStatusChanged',
      'UserKickedBroadcast',
      'RoomKickNotice',
      'ReceiveChatMessage',
      'ErrorNotice',
      'UserBannedNotice',
      'RoomBoxProgressUpdated',
      'RoomBoxClaimed'
    ];

    const allEvents = Array.from(new Set([...events, ...Object.keys(this.callbacks)]));
    allEvents.forEach(eventName => {
      this.connection.off(eventName);
      this.connection.on(eventName, (...args) => {
        if (this.callbacks[eventName]) {
          this.callbacks[eventName].forEach(cb => cb(...args));
        }
      });
    });

    try {
      await this.connection.start();
      console.log('Connected to YoYo SignalR RoomHub');
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      throw err;
    }
  }

  on(eventName, callback) {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
      // If connection is already created, register listener immediately with SignalR
      if (this.connection) {
        this.connection.off(eventName);
        this.connection.on(eventName, (...args) => {
          if (this.callbacks[eventName]) {
            this.callbacks[eventName].forEach(cb => cb(...args));
          }
        });
      }
    }
    this.callbacks[eventName].push(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks[eventName] = this.callbacks[eventName].filter(cb => cb !== callback);
    };
  }

  async joinRoom(roomId, password = null) {
    if (this.connection) {
      await this.connection.invoke('JoinRoom', roomId, password);
    }
  }

  async leaveRoom(roomId) {
    if (this.connection) {
      await this.connection.invoke('LeaveRoom', roomId);
    }
  }

  async takeSeat(roomId, seatIndex) {
    if (this.connection) {
      await this.connection.invoke('TakeSeat', roomId, seatIndex);
    }
  }

  async leaveSeat(roomId, seatIndex) {
    if (this.connection) {
      await this.connection.invoke('LeaveSeat', roomId, seatIndex);
    }
  }

  async toggleLock(roomId, isLocked, password = null) {
    if (this.connection) {
      await this.connection.invoke('ToggleRoomLock', roomId, isLocked, password);
    }
  }

  async kickUser(roomId, targetUserId, kickType = 'ThreeDays') {
    if (this.connection) {
      await this.connection.invoke('KickUserFromRoom', roomId, targetUserId, kickType);
    }
  }

  async sendMessage(roomId, content) {
    if (this.connection) {
      await this.connection.invoke('SendChatMessage', roomId, content);
    }
  }

  async sendImageMessage(roomId, imageUrl, caption = '') {
    if (this.connection) {
      await this.connection.invoke('SendImageMessage', roomId, imageUrl, caption);
    }
  }

  clearListeners(eventName = null) {
    if (eventName) {
      delete this.callbacks[eventName];
    } else {
      this.callbacks = {};
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
    this.callbacks = {};
  }
}

export const roomHubService = new RoomHubService();
