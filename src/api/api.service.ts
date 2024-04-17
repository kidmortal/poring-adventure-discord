import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { RegisterDiscordProfilePayload } from './dto/register';

async function asyncEmit<T>(ws: Socket, event: string, args: number | string | object): Promise<T> {
  return new Promise(function (resolve) {
    ws.emit(event, args, (response: T) => {
      resolve(response);
    });
  });
}

@Injectable()
export class ApiService {
  private socket = io(process.env.WEBSOCKET_API_URL);
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
    return asyncEmit<PoringUserProfile>(this.socket, 'get_discord_user', args.discordId);
  }

  registerDiscordProfile(args: RegisterDiscordProfilePayload) {
    return asyncEmit<PoringUserProfile | undefined>(this.socket, 'register_discord_profile', args);
  }
  getUserInventory(args: { discordId: string }) {
    return asyncEmit<any[]>(this.socket, 'get_discord_user_inventory', args.discordId);
  }
}
