export default {
    name: 'resume',
    description: 'Resumes the current track',
    inVc: true,          // Made consistent with your other commands
    sameVc: true,        // Made consistent with your other commands
    player: true,
    run: async ({client, eventArg}) => {  // Made async for consistency
        const player = await client.riffy.players.get(eventArg.guildId);  // Changed to guildId

        if (!player) {
            return eventArg.reply('There is no active player to resume.');
        }

        if (!player.paused) {
            return eventArg.reply('The player is already playing.');
        }

        await player.pause(false);
        return eventArg.reply('Resumed the current track.');
    },
};