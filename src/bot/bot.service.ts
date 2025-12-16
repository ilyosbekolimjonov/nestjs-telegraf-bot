import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Markup } from 'telegraf';

@Injectable()
export class BotService {
    private requiredChannels: string[];

    constructor(private configService: ConfigService) {
        this.requiredChannels = this.configService.get<string[]>('requiredChannels') || [];
    }

    async getUnsubscribedChannels(ctx: Context): Promise<string[]> {
        const userId = ctx.from!.id;
        const unsubscribed: string[] = [];

        for (const channel of this.requiredChannels) {
            try {
                const member = await ctx.telegram.getChatMember(channel, userId);

                if (['left', 'kicked'].includes(member.status)) {
                    unsubscribed.push(channel);
                }
            } catch (error) {
                console.error(`Kanal tekshirishda xato: ${channel}`, error);
                unsubscribed.push(channel);
            }
        }
        return unsubscribed;
    }

    async checkChannelMembership(ctx: Context): Promise<boolean> {
        const unsubscribed = await this.getUnsubscribedChannels(ctx);
        return unsubscribed.length === 0;
    }

    async sendChannelSubscriptionMessage(ctx: Context) {
        const unsubscribedChannels = await this.getUnsubscribedChannels(ctx);

        if (unsubscribedChannels.length === 0) {
            await ctx.reply(`✅ Barcha kerakli kanallarga obuna bo'lgansiz!\nBotdan foydalanishingiz mumkin.`);
            return;
        }

        const channelButtons = unsubscribedChannels.map((username, index) =>
            [Markup.button.url(`📢 ${index + 1}-kanal`, `https://t.me/${username.replace('@', '')}`)]
        );

        const checkButton = [Markup.button.callback('✅ Tekshirish', 'check_subscription')];

        await ctx.reply(`Xush Ko'rdik ${ctx.from?.first_name}!`);
        await ctx.reply(
            '❗️ Botdan to\'liq foydalanish uchun quyidagi kanal(lar)ga a\'zo bo\'lishingiz kerak:',
            Markup.inlineKeyboard([
                ...channelButtons,
                checkButton
            ])
        );
    }
}