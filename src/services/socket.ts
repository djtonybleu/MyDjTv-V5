import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL);
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinVenue(venueId: string) {
    if (this.socket) {
      this.socket.emit('join-venue', venueId);
    }
  }

  playTrack(venueId: string, track: any) {
    if (this.socket) {
      this.socket.emit('play-track', { venueId, track });
    }
  }

  changeVolume(venueId: string, volume: number) {
    if (this.socket) {
      this.socket.emit('volume-change', { venueId, volume });
    }
  }

  startCommercial(venueId: string, commercial: any) {
    if (this.socket) {
      this.socket.emit('commercial-start', { venueId, commercial });
    }
  }

  onUserCount(callback: (count: number) => void) {
    if (this.socket) {
      this.socket.on('user-count', callback);
    }
  }

  onTrackChanged(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('track-changed', callback);
    }
  }

  onVolumeUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('volume-updated', callback);
    }
  }

  onCommercialPlaying(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('commercial-playing', callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();