
const {
 default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore
 } = require('@whiskeysockets/baileys');

 require("qrcode-terminal");
 const pino = require('pino');
 const fs = require('fs');

 const config = JSON.parse(fs.readFileSync('./config.json'))
 const owner = config.owner
 const axios = require('axios')

async function atualizar () {
const verificar = await axios.get("https://raw.githubusercontent.com/kauannre/atualizacaodobot/main/versao.json")
if(!config.atualizarautomatico) return console.log("modo atualizar automatico desativado\ninicando o bot")
if(config.versao == verificar.data.versao) return console.log(`voce esta utilizando o slowed mais recente(${config.versao})\niniciando o bot`)
const aindex = await axios.get("https://raw.githubusercontent.com/kauannre/atualizacaodobot/main/index.js")
const oslowed = await axios.get("https://raw.githubusercontent.com/kauannre/atualizacaodobot/main/slowed.js")

console.log(`atualizando seu slowed para a versao ${verificar.data.versao}\n`)
console.log(`oque foi adicionado: ${verificar.data.nota}\n`)
await fs.writeFileSync('./index.js', aindex.data)
await fs.writeFileSync('./slowed.js', oslowed.data)
config.versao = verificar.data.versao
await fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))
console.log(`pronto, slowed atualizado!`)
console.log("reinicie o bot")
process.exit()
}

atualizar()
 async function connectToWhatsApp () {
  const {
   version
  } = await fetchLatestBaileysVersion();
  
const { state, saveCreds } = await useMultiFileAuthState("./connection")

//, silent ou debug
  const slowed = makeWASocket({
   printQRInTerminal: true,
   logger: pino({
    level: 'silent'
   }),

   browser: ['Slowed Client', 'Chrome', '4.0'],
   version: version,
   auth: state,
   defaultQueryTimeoutMs: undefined
  });



    // Store
    const store = makeInMemoryStore({
      logger: pino().child({
        level: 'silent', stream: 'store'
      })
    })

    store.readFromFile('./baileys_store.json')

    setInterval(() => {
      store.writeToFile('./baileys_store.json')
    }, 10000)

    store.bind(slowed.ev) 

  slowed.ev.on('connection.update', (update) => {
   const {
    connection, lastDisconnect
   } = update;

   if (connection === 'close') {
    const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
    console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)

    if (shouldReconnect) {
     connectToWhatsApp();
    }

   } else if (connection === 'open') {
    slowed.sendMessage(owner[0], {
     text: 'Bot conectado'
    });
    console.log('opened connection');
   }
  });

  slowed.ev.on('messages.upsert',
   connection => {
    const mek = connection.messages[0];
    if (!mek.message) return;
    if (connection.type != 'notify') return;
    if (mek.key.remoteJid === 'status@broadcast') return;
    
    console.log("MENSAGEM RECEBIDA");
    require('./slowed')(slowed, mek, store);
   });

  slowed.ev.on('creds.update',
   saveCreds);
 }

 // run in main file
 connectToWhatsApp(), (err) => console.error("[ Connection Error ]", JSON.stringify(err, undefined, 2));