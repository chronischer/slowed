const fs = require("fs");
const { generateWAMessageFromContent, downloadContentFromMessage, generateWAMessage, proto } = require("@whiskeysockets/baileys");
const baileys = require("@whiskeysockets/baileys");
const config = JSON.parse(fs.readFileSync('./config.json'))
 const owner = config.owner
const axios = require('axios');
const { spawn, exec } = require("child_process");
const util = require('util');
const execute = util.promisify(exec);

// Função para executar um comando e retornar uma Promise que será resolvida quando o comando terminar
function runcomando(comando, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(comando, args.split(" "), { shell: true, stdio: 'inherit' });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`O comando ${comando} terminou com código ${code}`));
      }
    });
  });
}

//função de pegar link de uma imagem em base64 ou caminho dela mesmo
async function uploadTelegraph(afoto) {
  try {
    let imageData
    const url = 'https://telegra.ph/upload'; // URL de destino
    
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;

    respbase64 =  base64Regex.test(afoto)
    if(respbase64) {
    imageData = Buffer.from(afoto, 'base64');
    } else {
    imageData = fs.readFileSync(afoto); // Substitua pelo caminho da sua imagem
    }

    const boundary = '----WebKitFormBoundary2otzWZAdHWILfv4x';

    const headers = {
      'Host': 'telegra.ph',
      'content-length': imageData.length,
      'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      'dnt': '1',
      'sec-ch-ua-mobile': '?1',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
      'content-type': `multipart/form-data; boundary=${boundary}`,
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'x-requested-with': 'XMLHttpRequest',
      'sec-ch-ua-platform': '"Android"',
      'origin': 'https://telegra.ph',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://telegra.ph/',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'pt-BR,pt;q=0.9',
    };

    const formData = new FormData();
    formData.append('file', new Blob([imageData]), {
      filename: 'blob',
      contentType: 'image/png',
    });

    const response = await axios.post(url, formData, { headers });

    const responseData = response.data;
    if (responseData[0].src && responseData[0].src.includes('file')) {
      return 'https://telegra.ph/' + responseData[0].src;
    } else {
      throw new Error('Falha ao obter o link da imagem');
    }
  } catch (error) {
    console.error(error);
    throw error; // Repassar o erro para quem chamou a função, se necessário.
  }
}

const tipodispositivo = (devicekk) => {
resp = devicekk.length > 28 ? 'android' : devicekk.substring(0, 2) === '3A' ? 'ios' : devicekk.startsWith("BAE5") ? 'baileys' : devicekk.startsWith("3EB0") ? 'web' : 'desconhecido';
return resp
}


const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getFileBuffer = async (mediakey, MediaType) => {
  
const stream = await downloadContentFromMessage(mediakey, MediaType)

let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
}


const getBuffer = async (url, opcoes) => {
try {
opcoes ? opcoes : {}
const post = await axios({
method: "get",
url,
headers: {
'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36', 
	'DNT': 1,
	'Upgrade-Insecure-Request': 1
},
...opcoes,
responseType: 'arraybuffer'
})
return post.data
} catch (erro) {
console.log(`Erro identificado: ${erro}`)
}
}


loggermek = false
printmek = false


module.exports = slowed = async(slowed, mek, store) => {
 try {
  const from = mek.key.remoteJid;
 const type = Object.keys(mek.message).find((key) => !['senderKeyDistributionMessage', 'messageContextInfo'].includes(key));

  const prefix = config.prefix;
  const budy = (type === 'conversation') ? mek.message.conversation: (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text: ''
const body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation: (type == 'imageMessage') && mek.message[type].caption.startsWith(prefix) ? mek.message[type].caption: (type == 'videoMessage') && mek.message[type].caption.startsWith(prefix) ? mek.message[type].caption: (type == 'extendedTextMessage') && mek.message[type].text.startsWith(prefix) ? mek.message[type].text: (type == 'listResponseMessage') && mek.message[type].singleSelectReply.selectedRowId ? mek.message.listResponseMessage.singleSelectReply.selectedRowId: (type == 'templateButtonReplyMessage') ? mek.message.templateButtonReplyMessage.selectedId: (type === 'messageContextInfo') ? mek.message[type].singleSelectReply.selectedRowId: (type == 'slowed.sendMessageButtonMessage') && mek.message[type].selectedButtonId ? mek.message[type].selectedButtonId: (type == 'stickerMessage') && ((mek.message[type].fileSha256.toString('base64')) !== null && (mek.message[type].fileSha256.toString('base64')) !== undefined) ? (mek.message[type].fileSha256.toString('base64')): "" || mek.message[type]?.selectedButtonId || ""

const comando = body.slice(1).trim().split(/ +/).shift().toLowerCase();
const isCmd = body.startsWith(prefix);
const args = body.trim().split(/ +/).slice(1);
const text = args.join(' ');

// Numero do bot
const me = slowed.user;
const nameBot = slowed.user.name || "Not found";
const botNumber = slowed.user.id.split(':')[0] + '@s.whatsapp.net';
const content = JSON.stringify(mek.message);
// Grupos
const isGroup = mek.key.remoteJid.endsWith('@g.us');
const sender = isGroup ? (mek.key.participant ? mek.key.participant: mek.participant): mek.key.remoteJid
const groupMetadata = isGroup ? await slowed.groupMetadata(from): ''
const groupId = isGroup ? groupMetadata.id: prefix + ''
const groupOwner = isGroup ? groupMetadata.owner: ''
const groupDesc = isGroup ? groupMetadata.desc: ''
const groupName = isGroup ? groupMetadata.subject: ''
const groupMembers = isGroup ? groupMetadata.participants: []
const participants = isGroup ? await groupMetadata.participants: ''
const groupAdmins = isGroup ? await participants.filter(v => v.admin !== null).map(v => v.id): ''
const isGroupAdmins = isGroup ? groupAdmins.includes(sender): false
const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
const pushname = mek.pushName ? mek.pushName : ''
const nmrp = sender.replace("@s.whatsapp.net", "")
const nmrp2 = from.replace("@g.us", "")
const nmrp3 = text.replace(new RegExp("[()+-/ +/]", "gi"), "").replace("@", '')
const nmrp4 = nmrp3.split('|')[0]
//const totalGrupos = await store.chats.all().filter(v => v.id.endsWith('@g.us')).map(v => v.id);

//é dono ou não 
const isOwner = owner.includes(sender) || mek.key.fromMe

//pegar id dos devices das pessoas
const getDevices = async(numeross, ignorarzero, bunitu) => {
cuk = []
cudinovu =[]
for(numerokkkkk of numeross) {
cuk.push({ tag: 'user', attrs:{jid:numerokkkkk}})}
iq ={ tag: 'iq',attrs: {to: baileys.S_WHATSAPP_NET,type: 'get',xmlns: 'usync',},content: [{tag: 'usync',attrs: {sid: slowed.generateMessageTag(),mode: 'query',last: 'true',index: '0',context: 'message',},content: [{tag: 'query',attrs: {},content: [{tag: 'devices',attrs: { version: '2' }}]},{ tag: 'list', attrs: {}, content: cuk }]},],};
const result = await slowed.query(iq);
const extracted = (0, baileys.extractDeviceJids)(result, slowed.user.id, ignorarzero);
 if(bunitu) {
 for(let extraidu of extracted) {
 if(extraidu.device == 0) {
 cudinovu.push(`${extraidu.user}@s.whatsapp.net`)
 }else {
 cudinovu.push(`${extraidu.user}:${extraidu.device}@s.whatsapp.net`)
 }
 }
 return cudinovu
 } else {
 return extracted
 }
  }


slowed.sendjsoninfo = (jidss, jsontxt = {}, outrasconfig = {}) => {
allmsg = generateWAMessageFromContent(jidss, proto.Message.fromObject(
jsontxt
), outrasconfig)
 
return slowed.sendMessage(jidss, {
    text: `${JSON.stringify(allmsg.message, null, 2)}
    
    ${allmsg.key.sender}
    `
   })
}


//enviar mensagem para apenas algumas pessoas do grupo
slowed.sendForContent = async(jidss, idnumero2k = [], jsontxt = {}, outrasconfig = {}) => {
numerodnv = ""
for(tododoi of idnumero2k) {
numerodnv += tododoi
}
if(!numerodnv.includes(":")) {
idnumeros = await getDevices(idnumero2k, false, true)
} else {
idnumeros = idnumero2k
}
allmsg = await generateWAMessageFromContent(jidss, proto.Message.fromObject(
jsontxt
), outrasconfig)
 
cu = await slowed.relayMessage(jidss, allmsg.message, { messageId: '', participant: {jid: botNumber}})

for(let jidds of idnumeros ) {
await slowed.relayMessage(jidss, allmsg.message, { messageId: cu, participant: {jid: jidds}})
}
return
}

//enviar mensagem para apenas algumas pessoas do grupo(marcando a pessoa)
slowed.sendForContent2 = async(jidss, idnumero2k = [], jsontxt = {}, outrasconfig = {}) => {
numerodnv = ""
for(tododoi of idnumero2k) {
numerodnv += tododoi
}
if(!numerodnv.includes(":")) {
idnumeros = await getDevices(idnumero2k, false, true)
} else {
idnumeros = idnumero2k
}
console.log(idnumeros)
allmsg = await generateWAMessageFromContent(jidss, proto.Message.fromObject(
jsontxt
), outrasconfig)
 
cu = await slowed.relayMessage(jidss, allmsg.message, { messageId: allmsg.key.id, participant: {jid: botNumber}})

for(let jidds of idnumeros ) {
if(!allmsg.contextInfo) allmsg.contextInfo = {mentionedJid: [jidds]}
else allmsg.contextInfo.mentionedJid = [jidds]
await slowed.relayMessage(jidss, allmsg.message, { messageId: cu, participant: {jid: jidds}})
}
return
}

//enviar mensagem para apenas algumas pessoas do grupo
slowed.sendFor = async(jidss, idnumero2k = [], jsontxt = {}, outrasconfig = {}) => {
numerodnv = ""
for(tododoi of idnumero2k) {
numerodnv += tododoi
}
if(!numerodnv.includes(":")) {
idnumeros = await getDevices(idnumero2k, false, true)
} else {
idnumeros = idnumero2k
}
allmsg = await generateWAMessage(jidss, jsontxt, {
                    upload: slowed.waUploadToServer,
                    ...outrasconfig,
                })
 
cu = await slowed.relayMessage(jidss, allmsg.message, { messageId: allmsg.key.id, participant: {jid: botNumber}})

for(let jidds of idnumeros ) {
await slowed.relayMessage(jidss, allmsg.message, { messageId: cu, participant: {jid: jidds}})
}
return
}
//enviar mensagem para apenas algumas pessoas do grupo(marcando a pessoa)
slowed.sendFor2 = async(jidss, idnumero2k = [], jsontxt = {}, outrasconfig = {}) => {
numerodnv = ""
for(tododoi of idnumero2k) {
numerodnv += tododoi
}
if(!numerodnv.includes(":")) {
idnumeros = await getDevices(idnumero2k, false, true)
} else {
idnumeros = idnumero2k
}
allmsg = await generateWAMessage(jidss, jsontxt, {
                    upload: slowed.waUploadToServer,
                    ...outrasconfig,
                })
 
cu = await slowed.relayMessage(jidss, allmsg.message, { messageId: allmsg.key.id, participant: {jid: botNumber}})

for(let jidds of idnumeros ) {
if(!allmsg.contextInfo) allmsg.contextInfo = {mentionedJid: [jidds]}
else allmsg.contextInfo.mentionedJid = [jidds]
await slowed.relayMessage(jidss, allmsg.message, { messageId: cu, participant: {jid: jidds}})
}
return
}

slowed.sendFor3 = async(jidss, idnumeros = [], texto) => {
lista = ""
for(numero of idnumeros) {
lista += numero.split("@")[0] + "\n"
}
 a = await slowed.sendMessage(jidss, {text: "mensagem privada, conteudo dela aparecer apenas para os:\n" + lista})

return await slowed.sendForContent(jidss, idnumeros, {
  "protocolMessage": {
    "key": a.key,
    "type": "MESSAGE_EDIT",
    "editedMessage": {
      "conversation": texto
    }
  }
})
}

//enviar mensagem por json
slowed.sendjson = (jidss, jsontxt = {}, outrasconfig = {}) => {
allmsg = generateWAMessageFromContent(jidss, proto.Message.fromObject(
jsontxt
), outrasconfig)
 
return slowed.relayMessage(jidss, allmsg.message, { messageId: allmsg.key.sender})
}

//enviar mensagem por json2(teste)

slowed.sendjson2 = (jidss, jsontxt = {}, outrasconfig = {}) => {
allmsg = generateWAMessageFromContent(jidss, jsontxt, outrasconfig)
return slowed.relayMessage(jidss, allmsg.message, { messageId: allmsg.key.sender})
}

//enviar mensagem por json 3(teste)
slowed.sendjson3 = (jidss, jsontxt = {}, outrasconfig = {}) => {
return slowed.relayMessage(jidss, jsontxt, outrasconfig)
}

    if(printmek) {
    console.log("[ Mek dev ]", JSON.stringify(mek, null, 2));
    }
    
    
    if(loggermek) {
    await fs.writeFileSync('./loggermek', JSON.stringify(mek, null, 2));
    mekk = await fs.readFileSync('./loggermek')
slowed.sendMessage(owner[0], { document: mekk, mimetype: 'text/plain', fileName: 'mek da mensagem aqui.json'}, {quoted: mek})
fs.unlinkSync('./mek')
    }

const iskey = (user)=> {
if (!fs.existsSync('./lib/premium.json')) {
fs.writeFileSync('./lib/premium.json', '[]');
}

const keys = JSON.parse(fs.readFileSync('./lib/premium.json'));
const isprem2 = keys.find((sla) => sla.key == user)
if(!isprem2) return false
const isprem3 = isprem2['key'] == user
preminfo = isprem2
if(preminfo.metodo == "quantidade") {
if(preminfo.expira < 1) {
remove = keys.indexOf(preminfo)
keys.splice(remove, 1)
fs.writeFileSync('./lib/premium.json', JSON.stringify(keys))
return false} else {
remove = keys.indexOf(preminfo)
keys.splice(remove, 1)
setprem = {}
setprem.expira = preminfo.expira - 1
setprem.key = preminfo.key
setprem.metodo = preminfo.metodo
keys.push(setprem)
fs.writeFileSync('./lib/premium.json', JSON.stringify(keys))
return true}} else if(preminfo.metodo == 'tempo') {
if(preminfo.expira < Date.now()){
remove = keys.indexOf(preminfo)
keys.splice(remove, 1)
fs.writeFileSync('./lib/premium.json', JSON.stringify(keys))
return false} else{
return true}} else if(preminfo.metodo == 'perma') {
return true} else {return false}}

const addkey = (akey) => {
const keys = JSON.parse(fs.readFileSync('./lib/premium.json'));
/*
{key: "numero", metodo: "tempo", expira: "1", fun: "add"}

{key: "numero", metodo: "quantidade", expira: "1", fun: "add"}

{key: "numero", metodo: "perma", expira: false, fun: "add"}

{key: "numero", fun: "remove"}
*/
var key = akey.key
var metodo = akey.metodo
var expira = akey.expira
var fun = akey.fun
if(fun == 'add') {

const data = Date.now() + parseInt(expira)*24*60*60*1000

testee = keys.find((sla) => sla.key == key)
if(testee){
remove = keys.indexOf(testee)
keys.splice(remove, 1)
}
if(metodo == 'tempo') {
keys.push({
"key": key, 
"metodo": metodo,
"expira": data
})
} else if(metodo == 'quantidade') {
keys.push({
"key": key, 
"metodo": metodo,
"expira": parseInt(expira)
})
} else if(metodo == 'perma') {
keys.push({
"key": key, 
"metodo": metodo,
"expira": false
})
} else {
return "você usou errado"
}
fs.writeFileSync('./lib/premium.json', JSON.stringify(keys))

return "usuario criado"

} else if(fun == 'remove') {

testee = keys.find((sla) => sla.key == key)
if(testee){
remove = keys.indexOf(testee)
keys.splice(remove, 1)
fs.writeFileSync('./lib/premium.json', JSON.stringify(keys))
return "Premium removido"
} else {
return "esse usuario não está com premium"
}

} else {
return "você usou errado"
  }}
  

const isPrem = iskey(sender) || iskey(from) || isOwner;

//TIPO DE MSG
const isVideo = (type == 'videoMessage')
const isImage = (type == 'imageMessage')
const isSticker = (type == 'stickerMessage')
const isLocLive = (type === 'liveLocationMessage')
const isContato = (type === 'contactMessage')
const isCatalogo = (type === 'productMessage')
const isLocalização = (type === 'locationMessage')
const isDocumento = (type === 'documentMessage')
const iscontactsArray = (type === 'contactsArrayMessage')
const isMedia = (type === 'imageMessage' || type === 'videoMessage')
const isQuotedMsg = (type == 'extendedTextMessage')
const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true: false: false
const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true: false: false
const isQuotedDocument = isQuotedMsg ? content.includes('documentMessage') ? true: false: false
const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true: false: false
const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true: false: false

  const enviar = (text) => {
   return slowed.sendMessage(from, {
    text: text
   }, {
    quoted: mek
   });
  }
  
  
//LOGGER DE MENSAGEM
if (!isGroup && isCmd) console.log(
'⚡COМANDO NO PV⚡','\n',
'‣ NICK :',pushname,'\n',
'‣ DISPOSITIVO :',tipodispositivo(mek.key.id),'\n',
'‣ NUMERO :',sender.split("@")[0],'\n',
'‣ CMD :',comando,'\n',
'‣ TEXTO DO CMD :',text,'\n')

if (!isCmd && !isGroup) console.log(
'⚡MENSAGEM NO PV ⚡','\n',
'‣ NICK :',pushname,'\n',
'‣ DISPOSITIVO :',tipodispositivo(mek.key.id),'\n',
'‣ NUMERO :',sender.split("@")[0],'\n',
'‣ MSG :',budy,'\n')

if (isCmd && isGroup) console.log(
'⚡COМANDO EM GRUPO ⚡','\n',
'‣ GRUPO :', groupName,'\n',
'‣ IDGP :',from,'\n',
'‣ NICK :',pushname,'\n',
'‣ DISPOSITIVO :',tipodispositivo(mek.key.id),'\n',
'‣ NUMERO :',sender.split("@")[0],'\n',
'‣ CMD :',comando,'\n',
'‣ TEXTO DO CMD :',text,'\n')

if (!isCmd && isGroup) console.log(
'⚡Menѕageм eм grυpo⚡','\n', 
'‣ GRUPO :', groupName, '\n', 
'‣ IDGP :',from,'\n',
'‣ NICK :',pushname,'\n',
'‣ DISPOSITIVO :',tipodispositivo(mek.key.id),'\n',
'‣ NUMERO :',sender.split("@")[0],'\n',
 '‣ MSG :', budy, '\n')

let files = fs.readdirSync(`./plugins`).filter((file) => file.endsWith(".js"))
menu = `MENU DO SLOWED CLIENT

COMANDOS
/printmek [on/off]
/loggermek [on/off]
/self [false/true/all]
/msgjson
/apagarplugin
/getallgps
/mek
/mek2
/eval
/cmd
/prefix
/limparqr

PLUGINS
`
//adicionar os comandos dentro do menu
for (const file of files) {
const { cmds, owner } = require(`./plugins/${file}`);
menu += file + ` - ${owner}
${cmds}\n`
}
if(config.selfbot == null) {
if (!isOwner) return;
}
//comandos antes do modo selfbot
for (const file of files) {
const { self } = require(`./plugins/${file}`);

if (!self) {
const { plugin } = require(`./plugins/${file}`);
plugin({slowed, mek, from, type, prefix, budy, body, comando, isCmd, args, text, me, nameBot, botNumber, content, isGroup, sender, groupMetadata, groupId, groupOwner, groupDesc, groupName, groupMembers, participants, groupAdmins, isGroupAdmins, isBotGroupAdmins, nmrp, nmrp2, nmrp3, nmrp4, isOwner, isVideo, isImage, isSticker, isLocLive, isContato, isCatalogo, isLocalização, isDocumento, iscontactsArray, isMedia, isQuotedMsg, isQuotedImage, isQuotedAudio, isQuotedDocument, isQuotedVideo, isQuotedSticker, enviar, store, axios, fs, addkey, iskey, isPrem, runcomando, sleep, getFileBuffer, baileys, getDevices, tipodispositivo, getBuffer, uploadTelegraph});
}
}
//modo selfbot
if(config.selfbot) {
if (!isOwner) return;
}
//comandos dps do modo selfbot 
for (const file of files) {
const { self} = require(`./plugins/${file}`);
if (self) {
const { plugin } = require(`./plugins/${file}`);
plugin({slowed, mek, from, type, prefix, budy, body, comando, isCmd, args, text, me, nameBot, botNumber, content, isGroup, sender, groupMetadata, groupId, groupOwner, groupDesc, groupName, groupMembers, participants, groupAdmins, isGroupAdmins, isBotGroupAdmins, nmrp, nmrp2, nmrp3, nmrp4, isOwner, isVideo, isImage, isSticker, isLocLive, isContato, isCatalogo, isLocalização, isDocumento, iscontactsArray, isMedia, isQuotedMsg, isQuotedImage, isQuotedAudio, isQuotedDocument, isQuotedVideo, isQuotedSticker, enviar, store, axios, fs, addkey, iskey, isPrem, runcomando, sleep, getFileBuffer, baileys, getDevices, tipodispositivo, getBuffer, uploadTelegraph});
}
}

  switch (comando) {
   case 'ping':
    enviar('Pong! aaaaa');
    break;

case 'prefix':
if (!isOwner) return enviar('só o meu dono pode usar isso');
config.prefix = text
 await fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))
 enviar("pronto")
 break
 
case 'limparqr':
if (!isOwner) return enviar('só o meu dono pode usar isso');
await runcomando('cd', 'connection && rm -rf pre-key* sender* session*')
enviar('pronto, qrcode limpo(se as mensagens continuar em aguarde reinicie o bot)')
break

case 'self':
if (!isOwner) return enviar('só o meu dono pode usar isso');
configproself = text == "false" ? false : text == "true" ? true : text == "all" ? null : "erro"
if(configproself == "erro") return enviar(`so pode: false/true/all
false = desativado
true = ativado
all = ativado para todos os comandos(inclusive os que são "publicos")`)
config.selfbot = configproself
await fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))
enviar('modo publico ativado')
break

case 'printmek':
if (!isOwner) return enviar('só o meu dono pode usar isso');
if(args[0] == "on") {
printmek = true
enviar('modo dev mek ativado')
}
if(args[0] == "off") {
printmek = false 
enviar('modo dev mek desativado')
}

break

case 'loggermek':
if (!isOwner) return enviar('só o meu dono pode usar isso');
if(args[0] == "on") {
loggermek = true
enviar('modo dev mek(no pv) ativado')
} if(args[0] == "off") {
loggermek = false
enviar('modo dev mek(no pv) desativado')
}
break

case 'comandos':
if(!text) return enviar('cade o texto?')
let pluginkk = require(`./plugins/${text}`);
enviar(`${text}.js - ${pluginkk.owner}
${pluginkk.cmds}`)

break

case 'plugins':
if (!isOwner) return enviar('só o meu dono pode usar isso');
meusplugins = 'SEUS PLUGINS:\n\n'
for(file of files) {
meusplugins += '->' + file + '\n'
} 
enviar(meusplugins)
break

case 'apagarplugin':
if (!isOwner) return enviar('só o meu dono pode usar isso');
fs.unlinkSync(`./plugins/${text}`)

enviar('plugin apagado')
break

case 'lerplugin':
if (!isOwner) return enviar('só o meu dono pode usar isso');
if(!text) return enviar('cade o texto?')
enviar(fs.readFileSync(`./plugins/${text}.js`))
break

case 'criarplugin':
if (!isOwner) return enviar('só o meu dono pode usar isso');
if(!text) return enviar('cade o texto?')
downloadd = `const plugin = async(imports) => {
const {slowed, mek, from, type, prefix, budy, body, comando, isCmd, args, text, me, nameBot, botNumber, content, isGroup, sender, groupMetadata, groupId, groupOwner, groupDesc, groupName, groupMembers, participants, groupAdmins, isGroupAdmins, isBotGroupAdmins, nmrp, nmrp2, nmrp3, nmrp4, isOwner, isVideo, isImage, isSticker, isLocLive, isContato, isCatalogo, isLocalização, isDocumento, iscontactsArray, isMedia, isQuotedMsg, isQuotedImage, isQuotedAudio, isQuotedDocument, isQuotedVideo, isQuotedSticker, enviar, store, axios, fs, addkey, iskey, isPrem, runcomando, sleep, getFileBuffer, baileys, getDevices, tipodispositivo, getBuffer, uploadTelegraph} = imports //todas as imports do slowed.js(se quiser remova as que voce nao vai usar)
switch (comando) {
case 'ping':
await enviar("pong")
break
}}

const owner = "kauan" //dono/criador do plugin

const cmds = \`/ping\` //comandos que tem no plugin

const self = true //se o plugin vai ser executado mesmo se tiver no modo selfbot ou não 

module.exports = {plugin, cmds, owner, self}
`
fs.writeFileSync(`./plugins/${text}.js`, downloadd);

enviar('plugin criado')
break

case 'menu':
enviar(menu)
break

case 'mek':
if (!isOwner) return enviar('só o meu dono pode usar isso');
if(!isQuotedMsg){
if(args[0] === 'msg') {
mekemarquivo = `${JSON.stringify(mek.message, null, 2)}
`
} else if(args[0] === 'all') {
mekemarquivo = `${JSON.stringify(mek, null, 2)}`
} else {
mekemarquivo = `MEK ORIGINAL —> ${JSON.stringify(mek, null, 2)}

MENSAGEM DO MEK —>  ${JSON.stringify(mek.message, null, 2)}
`
}
enviar(mekemarquivo)
} else{
if(args[0] === 'msg') {
mekemarquivo = `
${JSON.stringify(mek.message, null, 2)}
`
} else if (args[0] === 'quoted') {
mekemarquivo = `${JSON.stringify(mek.message.extendedTextMessage.contextInfo.quotedMessage, null, 2)}
`
} else if(args[0] === 'contexto') {
mekemarquivo = `${JSON.stringify(mek.message.extendedTextMessage.contextInfo, null, 2)}`
} else if(args[0] === 'all') {
mekemarquivo = `${JSON.stringify(mek, null, 2)}`
}else {
mekemarquivo = `MEK ORIGINAL —> ${JSON.stringify(mek, null, 2)}

MENSAGEM DO MEK —>  ${JSON.stringify(mek.message, null, 2)}

QUOTED DO MEK —>  ${JSON.stringify(mek.message.extendedTextMessage.contextInfo.quotedMessage, null, 2)}

CONTEXTO COMPLETO DO MEK —>  ${JSON.stringify(mek.message.extendedTextMessage.contextInfo, null, 2)}
`}
enviar(mekemarquivo)
}

break;

case 'mek2':
if (!isOwner) return enviar('só o meu dono pode usar isso');
if(!isQuotedMsg){
if(args[0] === 'msg') {
mekemarquivo = `${JSON.stringify(mek.message, null, 2)}
`
} else if(args[0] === 'all') {
mekemarquivo = `${JSON.stringify(mek, null, 2)}`
} else {
mekemarquivo = `MEK ORIGINAL —> ${JSON.stringify(mek, null, 2)}

MENSAGEM DO MEK —>  ${JSON.stringify(mek.message, null, 2)}
`
}
fs.writeFileSync('./mek', mekemarquivo);
slowed.sendMessage(from, { document: fs.readFileSync('./mek'), mimetype: 'text/plain', fileName: 'mek da mensagem aqui.json'})
fs.unlinkSync('./mek')
} else{
if(args[0] === 'msg') {
mekemarquivo = `
${JSON.stringify(mek.message, null, 2)}
`
} else if (args[0] === 'quoted') {
mekemarquivo = `${JSON.stringify(mek.message.extendedTextMessage.contextInfo.quotedMessage, null, 2)}
`
} else if(args[0] === 'contexto') {
mekemarquivo = `${JSON.stringify(mek.message.extendedTextMessage.contextInfo, null, 2)}`
} else if(args[0] === 'all') {
mekemarquivo = `${JSON.stringify(mek, null, 2)}`
}else {
mekemarquivo = `MEK ORIGINAL —> ${JSON.stringify(mek, null, 2)}

MENSAGEM DO MEK —>  ${JSON.stringify(mek.message, null, 2)}

QUOTED DO MEK —>  ${JSON.stringify(mek.message.extendedTextMessage.contextInfo.quotedMessage, null, 2)}

CONTEXTO COMPLETO DO MEK —>  ${JSON.stringify(mek.message.extendedTextMessage.contextInfo, null, 2)}
`}
await fs.writeFileSync('./mek', mekemarquivo);
slowed.sendMessage(from, { document: fs.readFileSync('./mek'), mimetype: 'text/plain', fileName: 'mek da mensagem aqui.json'})
fs.unlinkSync('./mek')
}

break;

case 'msgjson':
if(!text) return enviar('cade o texto?')
slowed.sendMessage(from, {text: JSON.stringify(text, null, 2)}, {quoted: mek});
break

case 'cmd':
if (!isOwner) return enviar('só o meu dono pode usar isso');
if(!text) return enviar('cade o texto?')
exec(budy.slice(4), (err, result) => {
if (err) return slowed.sendMessage(from, {text: err, }, {quoted: mek});
enviar(result);
})
break 

   case 'eval':
   if (!isOwner) return enviar('só o meu dono pode usar isso');
   if(!text) return enviar('cade o texto?')
    try {
     eval(`(async () => {
      try {
      await enviar('× [ Eval ] Comando executado!');
      ${budy.slice(5)}
      } catch(err) {
      console.error("[ Error ] ", JSON.stringify(err, null, 2));
      enviar(util.inspect(err));
      }
      })();`);
    } catch(err) {
     enviar(util.inspect(err));
     console.error("[ Error ] ", JSON.stringify(err, null, 2));
    }
    break;

   default:
    // code
   }
   /* code */
  } catch (e) {
   err = String(e);
   console.log('[ slowed Error ]', err);
   console.log('[ slowed Error ]', util.inspect(e));
   slowed.sendMessage(owner[0], {text: util.inspect(e)}, {quoted: mek})
  };
 }

 let file = require.resolve(__filename);
 fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update file: ${__filename}`);
  delete require.cache[file];
  require(file);
 });
 