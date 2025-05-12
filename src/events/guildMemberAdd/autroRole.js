import { Client, GuildMember, PermissionFlagsBits } from 'discord.js';

/**
 *
 * @param {Client} client
 * @param {GuildMember} eventArg
 */

export default async ({ eventArg, db }) => {
  try {
    // 1. Basic validations
    if (!eventArg?.guild?.available) return;
    if (!db?.mongoose?.autoRoleSchema) {
      console.error('Mongoose schema not available');
      return;
    }

    // 2. Fetch auto-role configuration
    const autoRole = await db.mongoose.autoRoleSchema.findOne({ guild_id: eventArg.guild.id });
    if (!autoRole?.role_id) return;

    // 3. Check if role exists in guild
    const targetRole = await eventArg.guild.roles.fetch(autoRole.role_id);
    if (!targetRole) {
      console.error(`Role ${autoRole.role_id} not found in guild`);
      return;
    }

    // 4. Check bot permissions
    const botMember = await eventArg.guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      console.error('Bot lacks Manage Roles permission');
      return;
    }

    // 5. Check role hierarchy
    if (targetRole.position >= botMember.roles.highest.position) {
      console.error(`Target role (${targetRole.name}) is higher than bot's highest role`);
      return;
    }

    // 6. Check if member already has the role
    if (eventArg.roles.cache.has(targetRole.id)) {
      return; // Already has the role
    }

    // 7. Assign the role with timeout to avoid rate limits
    await eventArg.roles.add(targetRole.id, 'Auto-role assignment');
    console.log(`Assigned ${targetRole.name} to ${eventArg.user.tag}`);

  } catch (error) {
    console.error('Error in auto-role assignment:', error);

    // Specific error handling
    if (error.code === 50013) {
      console.error('Missing permissions to assign roles');
    } else if (error.code === 50001) {
      console.error('Missing access to perform this action');
    }
  }
};