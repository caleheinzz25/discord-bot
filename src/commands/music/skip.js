export default {
    name: 'skip',
    description: 'Skips the current track',
    inVc: true,          // Consistent with your other commands
    sameVc: true,        // Consistent with your other commands
    player: true,
    run: async ({client, eventArg}) => {  // Made async for consistency
        const player = await client.riffy.players.get(eventArg.guildId);  // Using guildId

        if (!player) {
            return eventArg.reply('There is no active player to skip tracks.');
        }

        if (!player.current) {
            return eventArg.reply('There is no track currently playing.');
        }

        await player.stop();
        return eventArg.reply('Skipped the current track.');
    },
};
