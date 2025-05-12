export default {
    name: 'pause',
    description: 'Pauses the current track',
    inVc: true,  // Changed from inVoice to match your disconnect command
    sameVc: true, // Changed from sameVoice to match your disconnect command
    player: true,
    run: async ({client, eventArg}) => {
        const player = await client.riffy.players.get(eventArg.guildId); // Changed from guild.id to guildId to match your disconnect command

        if (!player) {
            return eventArg.reply('There is no active player to pause.');
        }

        if (player.paused) {
            return eventArg.reply('The player is already paused.');
        }

        await player.pause(true);
        return eventArg.reply('Paused the current track.');
    },
};