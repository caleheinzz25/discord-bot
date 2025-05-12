import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

const button = async ({client, eventArg, command}) => {

    if (!eventArg.isButton()) return;

    const player = client.riffy.players.get(eventArg.guild.id);

    if (eventArg.customId === 'pause') {
        await eventArg.deferUpdate();

        if (!player) return eventArg.followUp({ content: `The player doesn't exist`, ephemeral: true });

        player.pause(true);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('disconnect')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏺'),

                new ButtonBuilder()
                    .setCustomId('play')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('▶'),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏭')
            );

        return await eventArg.message.edit({
            components: [row]
        })
    } 
    if (eventArg.customId === 'play') {
        await eventArg.deferUpdate();

        if (!player) return eventArg.followUp({ content: `The player doesn't exist`, ephemeral: true });

        player.pause(false);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('disconnect')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏺'),

                new ButtonBuilder()
                    .setCustomId('pause')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏸'),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏭')
            )

        return await eventArg.message.edit({
            components: [row]
        })

    } 
    if (eventArg.customId === 'skip') {
        await eventArg.deferUpdate();

        if (!player) return eventArg.followUp({ content: `The player doesn't exist`, ephemeral: true });
        player.stop();

        const rowDisabled = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('disconnect')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏺')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('pause')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏸')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏭')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('skiped')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Skiped')
                    .setDisabled(true)
            );

        return await eventArg.message.edit({
            components: [rowDisabled]
        })
    }  
    if (eventArg.customId === 'disconnect') {
        await eventArg.deferUpdate();

        if (!player) return eventArg.followUp({ content: `The player doesn't exist`, ephemeral: true });
        player.destroy();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('disconnect')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏺')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('play')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('▶')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('skip')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏭')
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('skiped')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('Disconnected')
                    .setDisabled(true)
            )

        return await eventArg.message.edit({
            components: [row]
        })
    }
}
export {
    button
}