const mineflayer = require('mineflayer')
const http = require('http')

http.createServer((req, res) => {
  res.write("aktif")
  res.end()
}).listen(process.env.PORT || 3000)

let bot = null
let actionInterval = null
let reconnectTimeout = null

process.on('uncaughtException', (err) => {
  console.log("Büyük Hata:", err.message)
})

process.on('unhandledRejection', (err) => {
  console.log("Promise Hata:", err)
})

// 😎 Yeni Nick Sistemi
function randomNick() {
  const part1 = ["X","Z","Q","V","K","T","R"]
  const part2 = ["Flow","Rex","Dex","Zer","Vox","Nix","Flux"]
  const part3 = ["YT","Live","GG","PvP","HD","TV"]

  return part1[Math.floor(Math.random()*part1.length)] +
         part2[Math.floor(Math.random()*part2.length)] +
         part3[Math.floor(Math.random()*part3.length)] +
         Math.floor(Math.random()*90+10)
}

function createBot() {
  stopActions()

  const config = {
    host: process.env.host || "SUNUCU_IP",
    port: process.env.p || 25565,
    username: randomNick(),
    version: "1.16.5"
  }

  console.log("Bağlanıyor:", config.username)

  bot = mineflayer.createBot(config)

  bot.once('spawn', () => {
    console.log("Giriş başarılı")
    startActions()
  })

  bot.on('end', handleDisconnect)
  bot.on('error', (err) => console.log("Bot Hata:", err.message))
}

function handleDisconnect() {
  console.log("Bağlantı koptu → tekrar deneniyor")
  stopActions()

  if (reconnectTimeout) return
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null
    createBot()
  }, 30000)
}

function startActions() {
  actionInterval = setInterval(() => {
    if (!bot || !bot.entity) return

    const dirs = ['forward','back','left','right']
    dirs.forEach(d => bot.setControlState(d, false))
    bot.setControlState('jump', false)

    const action = Math.random()

    if (action < 0.4) {
      // 🚶 Yürü
      const d = dirs[Math.floor(Math.random()*dirs.length)]
      bot.setControlState(d, true)
      setTimeout(() => bot.setControlState(d, false), 1000 + Math.random()*2000)

    } else if (action < 0.7) {
      // 🦘 Zıpla
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)

    } else {
      // 🧍 Dur
    }

  }, 3000)
}

function stopActions() {
  if (actionInterval) clearInterval(actionInterval)
  actionInterval = null
}

createBot()

// ⏳ 40 SANİYEDE RESET + YENİ NICK
setInterval(() => {
  console.log("40 dakika doldu → reset + yeni nick")
  if (bot) bot.end()
}, 40 * 60 * 1000)
