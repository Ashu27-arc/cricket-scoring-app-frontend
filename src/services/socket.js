import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(import.meta.env.DEV ? 'http://localhost:5000' : 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinMatch(matchId) {
    if (this.socket && matchId) {
      this.socket.emit('join-match', matchId);
      console.log('Joined match:', matchId);
    }
  }

  leaveMatch(matchId) {
    if (this.socket && matchId) {
      this.socket.emit('leave-match', matchId);
      console.log('Left match:', matchId);
    }
  }

  onMatchUpdate(callback) {
    if (this.socket) {
      this.socket.on('match-update', callback);
    }
  }

  onOverCompleted(callback) {
    if (this.socket) {
      this.socket.on('over-completed', callback);
    }
  }

  onInningsEnded(callback) {
    if (this.socket) {
      this.socket.on('innings-ended', callback);
    }
  }

  onCommentaryUpdate(callback) {
    if (this.socket) {
      this.socket.on('commentary-update', callback);
    }
  }

  onMatchStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('match-status-update', callback);
    }
  }

  onMatchListUpdate(callback) {
    if (this.socket) {
      this.socket.on('match-list-update', callback);
    }
  }

  offMatchUpdate() {
    if (this.socket) {
      this.socket.off('match-update');
    }
  }

  offOverCompleted() {
    if (this.socket) {
      this.socket.off('over-completed');
    }
  }

  offInningsEnded() {
    if (this.socket) {
      this.socket.off('innings-ended');
    }
  }

  offCommentaryUpdate() {
    if (this.socket) {
      this.socket.off('commentary-update');
    }
  }

  offMatchStatusUpdate() {
    if (this.socket) {
      this.socket.off('match-status-update');
    }
  }

  offMatchListUpdate() {
    if (this.socket) {
      this.socket.off('match-list-update');
    }
  }

  // Clean up all event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.off('match-update');
      this.socket.off('over-completed');
      this.socket.off('innings-ended');
      this.socket.off('commentary-update');
      this.socket.off('match-status-update');
      this.socket.off('match-list-update');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  // Emit custom events
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;