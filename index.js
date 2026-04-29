const {
  Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder,
  SlashCommandBuilder, REST, Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1461623987527483446";

const GUILD_ID = "1498670473649586176";

const CHANNEL_RECRUTAMENTO = "1498670476573151463";
const CHANNEL_PENDENTE = "1498698416929247313";
const CHANNEL_APROVADOS = "1498670476069965961";
const CHANNEL_RECUSADOS = "1498698744693260318";

const ROLE_ID = "1498670473649586184";

const IMAGEM = "https://i.postimg.cc/t4JtFt4z/Captura-de-ecra-2026-04-28-145331.png";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const commands = [
  new SlashCommandBuilder()
    .setName("recrutamento_painel")
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

await interaction.deferReply({ ephemeral: true });

const channel = await client.channels.fetch(CHANNEL_RECRUTAMENTO);
await channel.send({ embeds: [embed], components: [row] });

return interaction.editReply("✅ Painel enviado!");
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
      .setTitle("📋 Nova Candidatura Pendente")
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

    const pendingChannel = await client.channels.fetch(CHANNEL_PENDENTE);
    await pendingChannel.send({ embeds: [embed], components: [row] });

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

    const approvedChannel = await client.channels.fetch(CHANNEL_APROVADOS);
    await approvedChannel.send(`✅ ${member} foi aprovado na Família 23.\n👤 Nome RP: **${nome}**\n🆔 ID: **${id}**`);

    await interaction.reply(`✅ ${member} aprovado! Cargo dado e nickname alterado.`);
  }

  if (interaction.isButton() && interaction.customId.startsWith("recusar_")) {
    const userId = interaction.customId.split("_")[1];
    const member = await interaction.guild.members.fetch(userId).catch(() => null);

    const refusedChannel = await client.channels.fetch(CHANNEL_RECUSADOS);
    await refusedChannel.send(`❌ Candidatura recusada${member ? `: ${member}` : ""}.`);

    await interaction.reply(`❌ Candidatura recusada${member ? `: ${member}` : ""}.`);
  }
});

client.login(TOKEN);
