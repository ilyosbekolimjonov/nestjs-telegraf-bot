import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { RegistrationScene } from './scenes/registration.scene';

@Module({
  imports: [UserModule],
  providers: [BotUpdate, BotService, RegistrationScene],
  exports: [BotService],
})
export class BotModule {}