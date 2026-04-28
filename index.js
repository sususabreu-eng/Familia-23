const {
  Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
  SlashCommandBuilder, REST, Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "COLOCA_AQUI_ID_DO_BOT";

const GUILD_ID = "1287024349441953915";
const CHANNEL_RECRUTAMENTO = "1289765876698189927";
const CHANNEL_STAFF = "1289235128614129746";
const ROLE_ID = "1287024349509058662";

const IMAGEM = "COLOCA_AQUI_LINK_DA_IMAGEM";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const commands = [
  new SlashCommandBuilder()
    .setName("painel")
    .setDescription("Enviar painel de recrutamento")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log(`Online como ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand() && interaction.commandName === "painel") {
    const embed = new EmbedBuilder()
      .setTitle("📥 RECRUTAMENTO FAMÍLIA 23")
      .setDescription("💗 Força • Lealdade • Respeito 💙\n\nClica no botão abaixo para te candidatares.")
      .setColor("#ff007f")
      .setImage(IMAGEM);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("recrutar")
        .setLabel("📩 Candidatar-se")
        .setStyle(ButtonStyle.Primary)
    );

    const channel = await client.channels.fetch(CHANNEL_RECRUTAMENTO);
    await channel.send({ embeds: [embed], components: [row] });

    return interaction.reply({ content: "✅ Painel enviado!", ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === "recrutar") {
    const modal = new ModalBuilder()
      .setCustomId("form_recrutamento")
      .setTitle("Candidatura Família 23");

    const nome = new TextInputBuilder()
      .setCustomId("nome")
      .setLabel("Nome no RP")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const id = new TextInputBuilder()
      .setCustomId("id")
      .setLabel("ID no servidor")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const idade = new TextInputBuilder()
      .setCustomId("idade")
      .setLabel("Idade")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const disponibilidade = new TextInputBuilder()
      .setCustomId("disponibilidade")
      .setLabel("Disponibilidade")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const motivo = new TextInputBuilder()
      .setCustomId("motivo")
      .setLabel("Porque queres entrar?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nome),
      new ActionRowBuilder().addComponents(id),
      new ActionRowBuilder().addComponents(idade),
      new ActionRowBuilder().addComponents(disponibilidade),
      new ActionRowBuilder().addComponents(motivo)
    );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "form_recrutamento") {
    const nome = interaction.fields.getTextInputValue("nome");
    const id = interaction.fields.getTextInputValue("id");
    const idade = interaction.fields.getTextInputValue("idade");
    const disponibilidade = interaction.fields.getTextInputValue("disponibilidade");
    const motivo = interaction.fields.getTextInputValue("motivo");

    const embed = new EmbedBuilder()
      .setTitle("📋 Nova Candidatura")
      .setColor("#00cfff")
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: "👤 Discord", value: `${interaction.user} | ${interaction.user.tag}` },
        { name: "🆔 Discord ID", value: interaction.user.id },
        { name: "Nome RP", value: nome },
        { name: "ID Servidor", value: id },
        { name: "Idade", value: idade },
        { name: "Disponibilidade", value: disponibilidade },
        { name: "Motivo", value: motivo }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprovar_${interaction.user.id}`)
        .setLabel("✅ Aprovar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`recusar_${interaction.user.id}`)
        .setLabel("❌ Recusar")
        .setStyle(ButtonStyle.Danger)
    );

    const staffChannel = await client.channels.fetch(CHANNEL_STAFF);
    await staffChannel.send({ embeds: [embed], components: [row] });

    return interaction.reply({
      content: "✅ Candidatura enviada com sucesso! Aguarda análise da staff.",
      ephemeral: true
    });
  }

  if (interaction.isButton() && interaction.customId.startsWith("aprovar_")) {
    const userId = interaction.customId.split("_")[1];
    const member = await interaction.guild.members.fetch(userId);

    const fields = interaction.message.embeds[0].fields;
    const nome = fields.find(f => f.name === "Nome RP")?.value || member.user.username;
    const id = fields.find(f => f.name === "ID Servidor")?.value || "SEM ID";

    await member.roles.add(ROLE_ID);
    await member.setNickname(`${nome} | ${id}`);

    await interaction.reply(`✅ ${member} aprovado! Cargo dado e nickname alterado.`);
  }

  if (interaction.isButton() && interaction.customId.startsWith("recusar_")) {
    const userId = interaction.customId.split("_")[1];
    const member = await interaction.guild.members.fetch(userId).catch(() => null);

    await interaction.reply(`❌ Candidatura recusada${member ? `: ${member}` : ""}.`);
  }
});

client.login(TOKEN);
