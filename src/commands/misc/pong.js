export default {
    name: 'pong',
    description: 'Replies with the bot ping!',
    run: async ({client, eventArg}) => {

        await eventArg.deferReply();

        const reply = await eventArg.fetchReply();
        const ping = reply.createdTimestamp - eventArg.createdTimestamp;

        eventArg.editReply(
        `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
        );

        return
    },
    deleted:true
};