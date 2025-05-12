export default {
    command: {
        name: 'ping',
        description: 'Replies with the bot ping!'
    },
    callback: async ({ client, eventArg }) => {
        try {
            // Defer the reply if not already responded to
            if (!eventArg.replied && !eventArg.deferred) {
                await eventArg.deferReply();
            }

            // Get the reply message (will be the defer message if we deferred)
            const reply = await eventArg.fetchReply();
            
            // Calculate round-trip latency
            const ping = reply.createdTimestamp - eventArg.createdTimestamp;
            
            // Edit the response with ping information
            await eventArg.editReply(
                `Pong! 🏓\n` +
                `• Bot Latency: ${ping}ms\n` +
                `• API Latency: ${client.ws.ping}ms`
            );
            
        } catch (error) {
            console.error('Error in ping command:', error);
            
            // Fallback response if something goes wrong
            if (!eventArg.replied && !eventArg.deferred) {
                await eventArg.reply({
                    content: 'Failed to calculate ping!',
                    ephemeral: true
                });
            } else {
                await eventArg.editReply('Failed to calculate ping!');
            }
        }
    }
};