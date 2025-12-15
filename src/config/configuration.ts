export default () => ({
    botToken: process.env.BOT_TOKEN!,
    requiredChannels: process.env.REQUIRED_CHANNELS?.split(',') || [],
});