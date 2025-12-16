import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Markup } from 'telegraf';

@Injectable()
export class BotService {
    private requiredChannels: string[];

    async processMessage(message: string): Promise<string> {
        return `Sizning xabaringiz: ${message}`;
    }

    constructor(private configService: ConfigService) {
        this.requiredChannels = this.configService.get<string[]>('requiredChannels') || [];
    }

    async checkChannelMembership(ctx: Context): Promise<boolean> {
        const userId = ctx.from!.id;

        for (const channel of this.requiredChannels) {
            try {
                const member = await ctx.telegram.getChatMember(channel, userId);

                if (['left', 'kicked'].includes(member.status)) {
                    return false;
                }
            } catch (error) {
                console.error(`Kanal tekshirishda xato: ${channel}`, error);
                return false;
            }
        }

        return true;
    }

    async sendChannelSubscriptionMessage(ctx: Context) {
        const channelButtons = this.requiredChannels.map((username, index) =>
            [Markup.button.url(`📢 ${index + 1}-kanal`, `https://t.me/${username.replace('@', '')}`)]
        );

        const checkButton = [Markup.button.callback('✅ Tekshirish', 'check_subscription')];
        
        await ctx.reply(`Xush Ko\'rdik ${ctx.from?.first_name}.`);
        await ctx.reply(
            '❗️ Botdan foydalanish uchun quyidagi kanallarga a\'zo bo\'lishingiz kerak:',
            Markup.inlineKeyboard([
                ...channelButtons,
                checkButton
            ])
        );
    }
}