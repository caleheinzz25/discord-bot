export default {
    name: 'disconnect',
    description: 'Disconnect the bot from your voice channel',
    inVc: true,
    sameVc: true,
    player: true,
    run: async ({client, eventArgs}) => {
        const player = await client.riffy.players.get(eventArgs.guildId);
        
        if (player) {
            await player.destroy();
            return eventArgs.reply('Disconnected from the voice channel.');
        } else {
            return eventArgs.reply('There is no active player to disconnect.');
        }
    },
    deleted: true
};