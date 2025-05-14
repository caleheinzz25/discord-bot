import { EmbedBuilder } from "discord.js";

export const jancu = async ({ client, eventArg, db }) => {
    if (eventArg.author.bot) return; // Ignore bot messages

    try {
        // Check if the bot was mentioned
        const botMentioned = eventArg.mentions.has(client.user.id);
        
        // Ensure guild_id is present
        const guildId = eventArg.guildId;
        if (!guildId) {
            return eventArg.channel.send("❌ Guild ID is required for this command.");
        }

        // Fetch channel configuration and conversation history from the database
        const [channelConfig, AIConversation] = await Promise.all([
            db.mongoose.AIChannels.findOne({ channel_id: eventArg.channel.id, guild_id: guildId }),
            db.mongoose.AIConversation.findOne({ channel_id: eventArg.channel.id, guild_id: guildId }),
        ]);

        // If the channel is not configured but bot is mentioned, proceed with default settings
        if (!channelConfig && !botMentioned) return;
        
        // If bot is mentioned but channel is not configured, use default settings
        const aiConfig = channelConfig || {
            ai_enabled: true,
            ai_name: client.user.username, // Use bot's username as default
            ai_description: `I am ${client.user.username}, a helpful AI assistant.` // Default description
        };

        if (!aiConfig.ai_enabled && !botMentioned) {
            return eventArg.channel.send("❌ AI is not active. Use `/ai-channel-enable` to activate.");
        }

        // Ensure conversation array doesn't exceed 35 messages
        let conversationHistory = AIConversation?.conversation || [];
        if (conversationHistory.length > 35) {
            conversationHistory = []; // Reset the conversation history if it exceeds 35 messages
        }

        // Remove the bot mention from the message content if present
        const userMessage = botMentioned 
            ? eventArg.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim()
            : eventArg.content;

        // Start chat with Gemini AI
        const chat = client.modelGemini.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `${aiConfig.ai_description} and named you ${aiConfig.ai_name}.`,
                        },
                    ],
                },
                {
                    role: "model",
                    parts: [{ text: "Great to meet you. What would you like to know?" }],
                },
                ...conversationHistory, // Use the filtered conversation history
            ],
        });

        // Send user input to AI and get the response
        const result = await chat.sendMessage(userMessage, {
            aiName: aiConfig.ai_name,
            aiDescription: aiConfig.ai_description,
        });

        if (!result || !result.response) {
            return eventArg.channel.send("❌ Error receiving response from the AI.");
        }

        const aiResponse = result.response.text();

        // Update the conversation in the database (only if it's a configured channel)
        if (channelConfig) {
            if (AIConversation) {
                AIConversation.conversation.push(
                    { role: "user", parts: [{ text: userMessage }] },
                    { role: "model", parts: [{ text: aiResponse }] }
                );
                await AIConversation.save();
            } else {
                await db.mongoose.AIConversation.create({
                    channel_id: eventArg.channel.id,
                    guild_id: guildId,
                    conversation: [
                        { role: "user", parts: [{ text: userMessage }] },
                        { role: "model", parts: [{ text: aiResponse }] },
                    ],
                });
            }
        }

        // Create and send an embed message
        const embed = new EmbedBuilder()
            .setTitle(`💡 ${aiConfig.ai_name}`)
            .setDescription(`${aiResponse}\n\n- Asked by **${eventArg.author.username}**`)
            .setColor("#00FF99")
            .setTimestamp();

        return eventArg.channel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Error in AI command:", error);
        return eventArg.channel.send("❌ An internal error occurred. Please try again later.");
    }
};