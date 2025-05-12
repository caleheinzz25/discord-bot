import { GatewayDispatchEvents, EmbedBuilder,Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { MusicChannel } from "../db/mongoose/schemas/MusicChannel.js"; // Ensure this path is correct
import { Dynamic } from "musicard";

export const riffyInit = (client) => {
    // This will send log when the lavalink node is connected.
    client.riffy.on("nodeConnect", (node) => {
        console.log(`Node "${node.name}" connected.`);
    });
    
    // This will send log when the lavalink node faced an error.
    client.riffy.on("nodeError", (node, error) => {
        console.log(`Node "${node.name}" encountered an error: ${error.message}.`);
    });
    
    /**
     * Event handler for when a track starts playing.
     * 
     * @event trackStart
     * @param {Player} player - The music player instance associated with the event.
     * @param {Track} track - The track that is currently playing.
     */
    client.riffy.on('trackStart', async (player, track) => {
         const requester = track.info.requester || { username: 'Unknown', displayAvatarURL: () => '' };

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
                    .setEmoji('⏭'),

            );
    
        const channel = client.channels.cache.get(player.textChannel);
    
        function formatTime(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
        }
    
        //disabling buttons when the song ends
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
                

            );
    
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("🎶 Now Playing")
            .setDescription(`[${track.info.title}](${track.info.uri})`)
            .addFields(
                { name: 'Author', value: track.info.author, inline: true },
                { name: "Duration", value: formatDuration(track.info.length), inline: true },
            )                                                                                                                       .setThumbnail(track.info.thumbnail || 'https://i.imgur.com/AfFp7pu.png') // Default thumbnail if none exists            .setURL(track.info.uri)
            .setFooter({
                text: `Requested by ${requester.username}`,
                iconURL: requester.displayAvatarURL(),
            })
            .setTimestamp();
        const msg = await channel
        .send({
            embeds: [embed],
            components: [row]})
        .then((x) => (player.message = x));
    });
    
    
    /**
     * Formats a duration in milliseconds to a `MM:SS` format.
     * 
     * @param {number} ms - The duration in milliseconds.
     * @returns {string} - The formatted duration as `MM:SS`.
     */
    function formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
    

    // This is the event handler for queue end.
    client.riffy.on("queueEnd", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);
        // Fetch the MusicChannel record from the database for the current guild
        const musicChannel = await MusicChannel.findOne({ guild_id: channel.guildId });
    
        // Check if a musicChannel record is found and if autoplay is enabled
        if (!musicChannel) {
            return channel.send("❌ No music channel configuration found in the database.");
        }
    
        // Check the auto_play setting from the database
        if (musicChannel.auto_play) {
            // If autoplay is enabled in the database, try to enable autoplay for the player
            player.autoplay(player);
        } else {
            // If autoplay is not enabled, destroy the player and notify the channel
            player.destroy();
            channel.send("Queue has ended.");
        }
    });
    
    
    // This will update the voice state of the player.
    client.on("raw", (d) => {
        if (
            ![
                GatewayDispatchEvents.VoiceStateUpdate,
                GatewayDispatchEvents.VoiceServerUpdate,
            ].includes(d.t)
        )
            return;
        client.riffy.updateVoiceState(d);
    });
    
}