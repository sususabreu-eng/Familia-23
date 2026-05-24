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
}=require("discord.js");

const TOKEN=process.env.TOKEN;

const CLIENT_ID="1461623987527483446";
const GUILD_ID="1498670473649586176";

const CHANNEL_RECRUTAMENTO="1498670476573151463";
const CHANNEL_PENDENTE="1498698416929247313";

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

const rest=new REST({
version:"10"
}).setToken(TOKEN);

client.once("clientReady",async()=>{

console.log(`Online ${client.user.tag}`);

try{

await rest.put(
Routes.applicationGuildCommands(
CLIENT_ID,
GUILD_ID
),
{
body:commands
}
);

console.log("Comandos carregados");

}catch(err){

console.log(err);

}

});

client.on(
"interactionCreate",
async interaction=>{

try{

// comando painel

if(
interaction.isChatInputCommand() &&
interaction.commandName==="recrutamento_painel"
){

await interaction.deferReply({
ephemeral:true
});

const embed=
new EmbedBuilder()

.setTitle(
"📥 RECRUTAMENTO FAMÍLIA 23 BAHAMAS"
)

.setDescription(
"💗 Força • Lealdade • Respeito 💙\n\nClica abaixo para te candidatares."
)

.setColor("#ff007f")
.setImage(IMAGEM);

const row=
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()
.setCustomId("recrutar")
.setLabel("📩 Candidatar")
.setStyle(ButtonStyle.Primary)

);

const canal=
await client.channels.fetch(
CHANNEL_RECRUTAMENTO
);

await canal.send({
embeds:[embed],
components:[row]
});

await interaction.editReply({
content:"✅ Painel enviado"
});

}


// botão candidatar

if(
interaction.isButton() &&
interaction.customId==="recrutar"
){

const modal=
new ModalBuilder()
.setCustomId("form")
.setTitle("Candidatura Bahamas");

const nome=
new TextInputBuilder()
.setCustomId("nome")
.setLabel("Nome RP")
.setStyle(TextInputStyle.Short)
.setRequired(true);

const id=
new TextInputBuilder()
.setCustomId("id")
.setLabel("ID Servidor")
.setStyle(TextInputStyle.Short)
.setRequired(true);

const telefone=
new TextInputBuilder()
.setCustomId("telefone")
.setLabel("Número celular in-game")
.setStyle(TextInputStyle.Short)
.setRequired(true);

modal.addComponents(

new ActionRowBuilder()
.addComponents(nome),

new ActionRowBuilder()
.addComponents(id),

new ActionRowBuilder()
.addComponents(telefone)

);

return interaction.showModal(
modal
);

}


// formulário enviado

if(
interaction.isModalSubmit() &&
interaction.customId==="form"
){

const nome=
interaction.fields.getTextInputValue(
"nome"
);

const id=
interaction.fields.getTextInputValue(
"id"
);

const telefone=
interaction.fields.getTextInputValue(
"telefone"
);

const embed=
new EmbedBuilder()

.setTitle(
"📋 Nova candidatura"
)

.setColor("#00cfff")

.addFields(

{
name:"👤 Nome RP",
value:nome
},

{
name:"🆔 ID Servidor",
value:id
},

{
name:"📱 Celular",
value:telefone
}

);

const canal=
await client.channels.fetch(
CHANNEL_PENDENTE
);

await canal.send({
embeds:[embed]
});

return interaction.reply({

content:
"✅ Candidatura enviada com sucesso!",

ephemeral:true

});

}

}catch(err){

console.log(err);

}

});

client.login(TOKEN);
