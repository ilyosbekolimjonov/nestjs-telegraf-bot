import { Scene, SceneEnter, On, Ctx, Action } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import type { BotContext } from '../interfaces/session.interface';
import { UserService } from '../../user/user.service';
import { REGIONS_DATA } from '../../constants/regions';

@Scene('registration')
export class RegistrationScene {
    constructor(private userService: UserService) { }

    @SceneEnter()
    async onEnter(@Ctx() ctx: BotContext) {
        ctx.session.registrationData = {};
        ctx.session.step = 'name';

        await ctx.reply('📝 Ro\'yxatdan o\'tishni boshlaymiz!\n\nIsmingizni kiriting:');
    }

    @On('text')
    async onText(@Ctx() ctx: BotContext) {
        const text = (ctx.message as any).text;
        const step = ctx.session.step;

        switch (step) {
            case 'name':
                await this.handleName(ctx, text);
                break;
            case 'age':
                await this.handleAge(ctx, text);
                break;
            case 'phone':
                await this.handlePhone(ctx, text);
                break;
            default:
                await ctx.reply('Iltimos, tugmalardan foydalaning.');
        }
    }

    @On('contact')
    async onContact(@Ctx() ctx: BotContext) {
        if (ctx.session.step === 'phone') {
            const contact = (ctx.message as any).contact;
            ctx.session.registrationData!.phone = contact.phone_number;

            await ctx.reply(
                '✅ Telefon raqam qabul qilindi!',
                Markup.removeKeyboard()
            );
            await this.askRegion(ctx);
        }
    }

    private async handleName(ctx: BotContext, name: string) {
        if (name.length < 2) {
            await ctx.reply('Ism juda qisqa. Iltimos, to\'g\'ri ism kiriting:');
            return;
        }

        ctx.session.registrationData!.name = name;
        ctx.session.step = 'age';
        await ctx.reply('Yoshingizni kiriting (masalan: 20):');
    }

    private async handleAge(ctx: BotContext, age: string) {
        const ageNum = parseInt(age);

        if (isNaN(ageNum) || ageNum < 10 || ageNum > 122) {
            await ctx.reply('Yosh oralig\'i quyidagicha bo\'lishi kerak -> 10-122 :');
            return;
        }

        ctx.session.registrationData!.age = age;
        ctx.session.step = 'phone';

        await ctx.reply(
            '📱 Telefon raqamingizni yuboring:\n\nTugmani bosing yoki qo\'lda kiriting (+998901234567):',
            Markup.keyboard([
                Markup.button.contactRequest('📱 Telefon raqamni yuborish')
            ]).resize().oneTime()
        );
    }

    private async handlePhone(ctx: BotContext, phone: string) {
        if (!/^\+?998\d{9}$/.test(phone.replace(/\s/g, ''))) {
            await ctx.reply('Iltimos, to\'g\'ri telefon raqam kiriting (+998901234567):');
            return;
        }

        ctx.session.registrationData!.phone = phone;
        await ctx.reply(
            '✅ Telefon raqam qabul qilindi!',
            Markup.removeKeyboard()
        );

        await this.askRegion(ctx);
    }

    private async askRegion(ctx: BotContext) {
        ctx.session.step = 'region';

        const buttons = Object.entries(REGIONS_DATA).map(([id, region]) => [
            Markup.button.callback(region.name, `region_${id}`)
        ]);

        await ctx.reply(
            '📍 Viloyatingizni tanlang:',
            Markup.inlineKeyboard(buttons)
        );

    }

    @Action(/region_(\d+)/)
    async onRegionSelect(@Ctx() ctx: BotContext) {
        const regionId = parseInt(ctx.match[1]);
        ctx.session.registrationData!.regionId = regionId;
        ctx.session.step = 'district';

        await ctx.answerCbQuery();

        const region = REGIONS_DATA[regionId];
        const buttons = region.districts.map(district => [
            Markup.button.callback(district.name, `district_${district.id}`)
        ]);

        await ctx.editMessageText(
            `📍 Tanlandi: ${region.name}\n\nTumaningizni tanlang:`,
            Markup.inlineKeyboard(buttons)
        );
    }

    @Action(/district_(\d+)/)
    async onDistrictSelect(@Ctx() ctx: BotContext) {
        const districtId = parseInt(ctx.match[1]);
        ctx.session.registrationData!.districtId = districtId;

        await ctx.answerCbQuery();
        await this.completeRegistration(ctx);
    }

    private async completeRegistration(ctx: BotContext) {
        const data = ctx.session.registrationData!;
        const chatId = ctx.from!.id.toString();

        try {
            await this.userService.createUser({
                chatId,
                name: data.name!,
                age: data.age!,
                phone: data.phone!,
                regionId: data.regionId!,
                districtId: data.districtId!,
            });

            ctx.session.registrationData = undefined;
            ctx.session.step = undefined;

            await ctx.editMessageText(
                '✅ Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!\n\n' +
                `📝 Sizning ma\'lumotlaringiz:\n` +
                `👤 Ism: ${data.name}\n` +
                `🎂 Yosh: ${data.age}\n` +
                `📱 Telefon: ${data.phone}`
            );

            await ctx.scene.leave();
            await ctx.reply('Asosiy menyuga xush kelibsiz! 🎉');

        } catch (error) {
            console.error('Registratsiya xatosi:', error);
            await ctx.reply('❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
            await ctx.scene.leave();
        }
    }
}