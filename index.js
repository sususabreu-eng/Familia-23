const {
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
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1461623987527483446";
const GUILD_ID = "1498670473649586176";

const CHANNEL_RECRUTAMENTO = "1498670476573151463";
const CHANNEL_PENDENTE = "1498698416929247313";
const CHANNEL_APROVADOS = "1498670476069965961";
const CHANNEL_RECUSADOS = "1498698744693260318";

const ROLE_ID = "1498670473649586184";
const ROLE_VISITANTE = "1498670473649586183";

const IMAGEM = "https://i.postimg.cc/jjbwdj9S/6e82bcb2-477c-4f56-ab47-b74988697e50.png";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName("recrutamento_painel")
    .setDescription("Enviar painel recrutamento")
].map(c=>c.toJSON());

const rest = new REST({version:"10"}).setToken(TOKEN);

client.once("clientReady", async()=>{

try{

await rest.put(
Routes.applicationGuildCommands(
CLIENT_ID,
GUILD_ID
),
{body:commands}
);

console.log(`Online como ${client.user.tag}`);

}catch(err){
console.error(err);
}

});

client.on("interactionCreate", async interaction=>{

try{

if(
interaction.isChatInputCommand() &&
interaction.commandName==="recrutamento_painel"
){

const embed = new EmbedBuilder()
.setTitle("📥 RECRUTAMENTO FAMÍLIA 23 BAHAMAS")
.setDescription(
"💗 Força • Lealdade • Respeito 💙\n\nClica abaixo para te candidatares."
)
.setColor("#ff007f")
.setImage(IMAGEM);

const row = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId("recrutar")
.setLabel("📩 Candidatar")
.setStyle(ButtonStyle.Primary)
);

await interaction.reply({
content:"✅ Painel enviado",
ephemeral:true
});

const channel = await client.channels.fetch(CHANNEL_RECRUTAMENTO);

await channel.send({
embeds:[embed],
components:[row]
});

}


if(
interaction.isButton() &&
interaction.customId==="recrutar"
){

const modal=new ModalBuilder()
.setCustomId("form_recrutamento")
.setTitle("Candidatura Bahamas");

const campos=[

["nome","Nome RP",TextInputStyle.Short],
["id","ID Servidor",TextInputStyle.Short],
["idade","Idade",TextInputStyle.Short],
["disponibilidade","Disponibilidade",TextInputStyle.Short],
["motivo","Porque queres entrar?",TextInputStyle.Paragraph]

];

campos.forEach(c=>{

modal.addComponents(
new ActionRowBuilder()
.addComponents(
new TextInputBuilder()
.setCustomId(c[0])
.setLabel(c[1])
.setStyle(c[2])
.setRequired(true)
)
);

});

return interaction.showModal(modal);

}

if(
interaction.isModalSubmit() &&
interaction.customId==="form_recrutamento"
){

const nome=interaction.fields.getTextInputValue("nome");
const id=interaction.fields.getTextInputValue("id");
const idade=interaction.fields.getTextInputValue("idade");
const disponibilidade=interaction.fields.getTextInputValue("disponibilidade");
const motivo=interaction.fields.getTextInputValue("motivo");

const embed=new EmbedBuilder()

.setTitle("📋 Nova candidatura")
.setColor("#00cfff")

.addFields(

{name:"Nome RP",value:nome},
{name:"ID Servidor",value:id},
{name:"Idade",value:idade},
{name:"Disponibilidade",value:disponibilidade},
{name:"Motivo",value:motivo}

);

const row=new ActionRowBuilder()

.addComponents(

new ButtonBuilder()
.setCustomId(`aprovar_${interaction.user.id}`)
.setLabel("✅ Aprovar")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId(`recusar_${interaction.user.id}`)
.setLabel("❌ Recusar")
.setStyle(ButtonStyle.Danger)

);

const canal=await client.channels.fetch(
CHANNEL_PENDENTE
);

await canal.send({
embeds:[embed],
components:[row]
});

return interaction.reply({
content:"✅ Candidatura enviada",
ephemeral:true
});

}

if(
interaction.isButton() &&
interaction.customId.startsWith("aprovar_")
){

const userId=interaction.customId.split("_")[1];

const member=
await interaction.guild.members.fetch(userId);

const fields=
interaction.message.embeds[0].fields;

const nome=
fields.find(f=>f.name==="Nome RP").value;

const id=
fields.find(f=>f.name==="ID Servidor").value;

await member.roles.add(ROLE_ID);

await member.roles.remove(
ROLE_VISITANTE
);

await member.setNickname(
`${nome} | ${id}`
);

await interaction.update({

content:"✅ Aprovado",
embeds:interaction.message.embeds,
components:[]

});

}

if(
interaction.isButton() &&
interaction.customId.startsWith("recusar_")
){

await interaction.update({

content:"❌ Recusado",
embeds:interaction.message.embeds,
components:[]

});

}

}catch(err){

console.error(err);

if(!interaction.replied){

interaction.reply({
content:"❌ Erro interno",
ephemeral:true
}).catch(()=>{});

}

}

});

process.on(
"unhandledRejection",
console.error
);

client.login(TOKEN);
