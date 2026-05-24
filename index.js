import {
Client,
GatewayIntentBits,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
EmbedBuilder,
SlashCommandBuilder,
REST,
Routes
} from "discord.js";

const TOKEN=process.env.TOKEN;

const CLIENT_ID="1461623987527483446";
const GUILD_ID="1498670473649586176";

const CHANNEL_RECRUTAMENTO="1498670476573151463";
const CHANNEL_PENDENTE="1498698416929247313";

const ROLE_ID="1498670473649586184";
const ROLE_VISITANTE="1498670473649586183";

const IMAGEM="https://i.postimg.cc/jjbwdj9S/6e82bcb2-477c-4f56-ab47-b74988697e50.png";

const client=new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers
]
});

const commands=[
new SlashCommandBuilder()
.setName("recrutamento_painel")
.setDescription("Enviar painel")
].map(c=>c.toJSON());

const rest=new REST({version:"10"}).setToken(TOKEN);

client.once("clientReady",async()=>{

console.log(`Online ${client.user.tag}`);

await rest.put(
Routes.applicationGuildCommands(
CLIENT_ID,
GUILD_ID
),
{body:commands}
);

});

client.on("interactionCreate",async interaction=>{

try{

if(
interaction.isChatInputCommand() &&
interaction.commandName==="recrutamento_painel"
){

await interaction.deferReply({
ephemeral:true
});

const embed=new EmbedBuilder()
.setTitle("📥 RECRUTAMENTO FAMÍLIA 23 BAHAMAS")
.setDescription("Clica abaixo para entrar")
.setColor("#ff007f")
.setImage(IMAGEM);

const row=new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId("recrutar")
.setLabel("📩 Candidatar")
.setStyle(ButtonStyle.Primary)
);

const canal=await client.channels.fetch(CHANNEL_RECRUTAMENTO);

await canal.send({
embeds:[embed],
components:[row]
});

await interaction.editReply({
content:"✅ Painel enviado"
});

}

if(
interaction.isButton() &&
interaction.customId==="recrutar"
){

const modal=new ModalBuilder()
.setCustomId("form")
.setTitle("Candidatura Bahamas");

const nome=new TextInputBuilder()
.setCustomId("nome")
.setLabel("Nome RP")
.setStyle(TextInputStyle.Short)
.setRequired(true);

const id=new TextInputBuilder()
.setCustomId("id")
.setLabel("ID Servidor")
.setStyle(TextInputStyle.Short)
.setRequired(true);

const telefone=new TextInputBuilder()
.setCustomId("telefone")
.setLabel("Celular in-game")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(nome),
new ActionRowBuilder().addComponents(id),
new ActionRowBuilder().addComponents(telefone)
);

await interaction.showModal(modal);

}

}catch(err){

console.log(err);

}

});

client.login(TOKEN);
