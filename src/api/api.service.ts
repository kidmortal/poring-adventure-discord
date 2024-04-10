import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

async function asyncEmit<T>(
  ws: Socket,
  event: string,
  args: number | string | object,
): Promise<T> {
  return new Promise(function (resolve) {
    ws.emit(event, args, (response: T) => {
      resolve(response);
    });
  });
}

@Injectable()
export class ApiService {
  private socket = io(process.env.WEBSOCKET_API_URL, {
    auth: { acessToken: '' },
  });
  constructor() {
    this.socket.on('connect', () => {
      console.log('connected');
    });
    this.socket.on('disconnect', () => {
      console.log('disconnected');
    });

    this.socket.on('connect_error', () => {
      console.log('error');
    });
  }

  getUserProfile(args: { discordId: string }) {
    return asyncEmit<string>(this.socket, 'get_discord_user', args.discordId);
  }
}
