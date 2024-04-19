import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { createHash } from 'crypto';

async function asyncEmit<T>(ws: Socket, event: string, args: number | string | object): Promise<T> {
  return new Promise(function (resolve) {
    ws.emit(event, args, (response: T) => {
      resolve(response);
    });
  });
}

@Injectable()
export class ApiService {
  private socket = io(process.env.WEBSOCKET_API_URL, {
    auth: { accessToken: createHash('md5').update(process.env.DISCORD_API_TOKEN).digest('hex') },
  });
  private logger = new Logger();
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
    this.socket.on('error_notification', (message) => this.logger.error(message));
  }

  getUserProfile(dto: GetDiscordUserDto) {
    return asyncEmit<PoringUserProfile>(this.socket, 'get_discord_user', dto);
  }
  getUserBattle(dto: GetDiscordBattleDto) {
    return asyncEmit<UserBattle>(this.socket, 'get_discord_battle', dto);
  }

  registerDiscordProfile(args: RegisterDiscordProfileDto) {
    return asyncEmit<PoringUserProfile | undefined>(this.socket, 'register_discord_profile', args);
  }
  getUserInventory(args: { discordId: string }) {
    return asyncEmit<any[]>(this.socket, 'get_discord_user_inventory', args.discordId);
  }
}
