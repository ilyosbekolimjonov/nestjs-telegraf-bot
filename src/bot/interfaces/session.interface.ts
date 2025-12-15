import { Context, Scenes } from 'telegraf';

export interface SessionData extends Scenes.SceneSession {
    step?: 'name' | 'age' | 'phone' | 'region' | 'district';
    registrationData?: {
        name?: string;
        age?: string;
        phone?: string;
        regionId?: number;
        districtId?: number;
    };
}

export interface BotContext extends Context {
    session: SessionData;
    match: RegExpExecArray;
    scene: Scenes.SceneContextScene<BotContext>;
}