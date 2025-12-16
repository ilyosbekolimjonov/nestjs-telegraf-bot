import { Update, Ctx, Start, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';
import { UserService } from '../user/user.service';
import type { BotContext } from './interfaces/session.interface';

@Update()
export class BotUpdate {
    constructor(
        private botService: BotService,
        private userService: UserService,
    ){}

    @Start()
    async start(@Ctx() ctx: BotContext) {
        const telegramId = ctx.from!.id.toString();

        const isMember = await this.botService.checkChannelMembership(ctx);
        if (!isMember) {
            await this.botService.sendChannelSubscriptionMessage(ctx);
            return;
        }

        const isRegistered = await this.userService.isUserRegistered(telegramId);
        if (isRegistered) {
            await ctx.reply(`Xush Ko\'rdik ${ctx.from?.first_name}.`);
        } else {
            await ctx.scene.enter('registration')
        }
    }

    @Action('check_subscription')
    async checkSubscription(@Ctx() ctx: BotContext) {
        const isMember = await this.botService.checkChannelMembership(ctx);

        if (isMember) {
            await ctx.answerCbQuery('✅ Tasdiqlandi!');
            await ctx.deleteMessage();

            const telegramId = ctx.from!.id.toString();
            const isRegistered = await this.userService.isUserRegistered(telegramId);

            if (!isRegistered) {
                await ctx.scene.enter('registration')
            } else {
                await ctx.reply(`Xush Ko\'rdik ${ctx.from?.first_name}.`);
            }
        } else {
            await ctx.answerCbQuery('❌ Siz hali barcha kanallarga a\'zo bo\'lmadingiz!', { show_alert: true });
        }
    }
}