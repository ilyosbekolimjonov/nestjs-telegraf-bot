import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotModule } from './bot/bot.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN!,
      middlewares: [session()],
      include: [BotModule],
    }),
    PrismaModule,
    BotModule,
    UserModule,
  ],
})
export class AppModule {}