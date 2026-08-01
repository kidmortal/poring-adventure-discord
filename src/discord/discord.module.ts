import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { ApiModule } from 'src/api/api.module';
import { AdminTokenGuard } from './admin.guard';
import { AdminPageController } from './adminPage.controller';

@Module({
  imports: [ApiModule],
  controllers: [AdminPageController, DiscordController],
  providers: [DiscordService, AdminTokenGuard],
})
export class DiscordModule {}
