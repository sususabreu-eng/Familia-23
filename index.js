const {
Client,
GatewayIntentBits,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
EmbedBuilder
}=require("discord.js");

const TOKEN=process.env.TOKEN;

const CHANNEL_RECRUTAMENTO="1498670476573151463";
const CHANNEL_PENDENTE="1498698416929247313";
const CHANNEL_APROVADOS="1498670476069965961";
const CHANNEL_RECUSADOS="1498698744693260318";

const ROLE_ID="1498670473649586184";
const ROLE_VISITANTE="1498670473649586183";

const IMAGEM="https://i.postimg.cc/jjbwdj9S/6e82bcb2-477c-4f56-ab47-b74988697e50.png";

const client=new Client({

intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers
]

});

client.once("clientReady",()=>{

console.log(
`Online ${client.user.tag}`
);

});

client.on(
"interactionCreate",
async interaction=>{

try{

// painel

if(
interaction.isChatInputCommand() &&
interaction.commandName==="recrutamento_painel"
){

const embed=
new EmbedBuilder()

.setTitle(
"📥 RECRUTAMENTO FAMÍLIA BAHAMAS"
)

.setDescription(

`💗 Força • Lealdade • Respeito 💙

📋 Faz tua candidatura
🛡️ Aguarda aprovação
🔥 Mostra o teu valor`

)

.setColor("#ff007f")
.setImage(IMAGEM);

const row=
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("recrutar")
.setLabel("📩 Candidatar")
.setStyle(
ButtonStyle.Primary
)

);

const canal=
await client.channels.fetch(
CHANNEL_RECRUTAMENTO
);

await canal.send({

embeds:[embed],
components:[row]

});

return interaction.reply({

content:"✅ Painel enviado",

ephemeral:true

});

}


// botão candidatar

if(
interaction.isButton() &&
interaction.customId==="recrutar"
){

const modal=
new ModalBuilder()

.setCustomId(
"form"
)

.setTitle(
"Candidatura Bahamas"
);

const nome=
new TextInputBuilder()

.setCustomId("nome")
.setLabel("Nome RP")
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const id=
new TextInputBuilder()

.setCustomId("id")
.setLabel("ID Servidor")
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const telefone=
new TextInputBuilder()

.setCustomId("telefone")
.setLabel(
"Número celular in-game"
)
.setStyle(
TextInputStyle.Short
)
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
name:"🆔 ID",
value:id
},

{
name:"📱 Celular",
value:telefone
}

);

const row=
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId(
`aprovar_${interaction.user.id}`
)

.setLabel(
"✅ Aprovar"
)

.setStyle(
ButtonStyle.Success
),

new ButtonBuilder()

.setCustomId(
`recusar_${interaction.user.id}`
)

.setLabel(
"❌ Recusar"
)

.setStyle(
ButtonStyle.Danger
)

);

const canal=
await client.channels.fetch(
CHANNEL_PENDENTE
);

await canal.send({

embeds:[embed],
components:[row]

});

return interaction.reply({

content:
"✅ Candidatura enviada!",

ephemeral:true

});

}


// aprovar

if(
interaction.isButton() &&
interaction.customId.startsWith(
"aprovar_"
)
){

const userId=
interaction.customId.split("_")[1];

const member=
await interaction.guild.members.fetch(
userId
);

const fields=
interaction.message.embeds[0].fields;

const nome=
fields[0].value;

const id=
fields[1].value;

await member.roles.add(
ROLE_ID
);

await member.roles.remove(
ROLE_VISITANTE
);

await member.setNickname(
`${nome} | ${id}`
).catch(()=>{});

const canalAprovados=
await client.channels.fetch(
CHANNEL_APROVADOS
);

await canalAprovados.send(

`✅ **Novo membro aprovado**

👤 Nome RP: ${nome}
🆔 ID: ${id}
🙋 Membro: ${member}
🛡️ Staff: ${interaction.user}`

);

await interaction.update({

content:"✅ Aprovado",

embeds:interaction.message.embeds,
components:[]

});

}


// recusar

if(
interaction.isButton() &&
interaction.customId.startsWith(
"recusar_"
)
){

const userId=
interaction.customId.split("_")[1];

const member=
await interaction.guild.members.fetch(
userId
).catch(()=>null);

const canalRecusados=
await client.channels.fetch(
CHANNEL_RECUSADOS
);

await canalRecusados.send(

`❌ **Candidatura recusada**

🙋 Membro: ${member || "Desconhecido"}
🛡️ Staff: ${interaction.user}`

);

await interaction.update({

content:"❌ Recusado",

embeds:interaction.message.embeds,
components:[]

});

}

}catch(err){

console.log(err);

if(
!interaction.replied
){

interaction.reply({

content:
"❌ Erro interno",

ephemeral:true

}).catch(()=>{});

}

}

});

client.login(TOKEN);
