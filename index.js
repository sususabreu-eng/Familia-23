const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const CHANNEL_RECRUTAMENTO = "1289765876698189927";
const CHANNEL_STAFF = "1289235128614129746";
const ROLE_ID = "1287024349509058662";

client.once('ready', async () => {
  console.log(`Online: ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_RECRUTAMENTO);

  const embed = new EmbedBuilder()
    .setTitle("📥 RECRUTAMENTO FAMÍLIA 23")
    .setDescription("Clica no botão abaixo para te candidatares")
    .setColor("#ff007f");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("recrutar")
      .setLabel("📩 Candidatar-se")
      .setStyle(ButtonStyle.Primary)
  );

  channel.send({ embeds: [embed], components: [row] });
});

client.on('interactionCreate', async interaction => {

  if (interaction.isButton() && interaction.customId === "recrutar") {

    const modal = new ModalBuilder()
      .setCustomId("form")
      .setTitle("Candidatura");

    const nome = new TextInputBuilder()
      .setCustomId("nome")
      .setLabel("Nome RP")
      .setStyle(TextInputStyle.Short);

    const id = new TextInputBuilder()
      .setCustomId("id")
      .setLabel("ID")
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nome),
      new ActionRowBuilder().addComponents(id)
    );

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit()) {

    const nome = interaction.fields.getTextInputValue("nome");
    const id = interaction.fields.getTextInputValue("id");

    const canal = await client.channels.fetch(CHANNEL_STAFF);

    const embed = new EmbedBuilder()
      .setTitle("📋 Nova Candidatura")
      .addFields(
        { name: "👤 User", value: `${interaction.user.tag}` },
        { name: "Nome RP", value: nome },
        { name: "ID", value: id }
      )
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprovar_${interaction.user.id}_${nome}_${id}`)
        .setLabel("Aprovar")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`recusar_${interaction.user.id}`)
        .setLabel("Recusar")
        .setStyle(ButtonStyle.Danger)
    );

    canal.send({ embeds: [embed], components: [row] });

    await interaction.reply({ content: "Candidatura enviada!", ephemeral: true });
  }

  if (interaction.isButton()) {

    if (interaction.customId.startsWith("aprovar")) {

      const parts = interaction.customId.split("_");
      const userId = parts[1];
      const nome = parts[2];
      const id = parts[3];

      const member = await interaction.guild.members.fetch(userId);

      await member.roles.add(ROLE_ID);
      await member.setNickname(`${nome} | ${id}`);

      await interaction.reply("Aprovado com sucesso");
    }

    if (interaction.customId.startsWith("recusar")) {
      await interaction.reply("Candidatura recusada");
    }
  }
});

client.login(process.env.TOKEN);
