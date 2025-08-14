# mcLoad – Minecraft Bot Attack

A Node.js-based Minecraft bot attack tool using [Mineflayer](https://github.com/PrismarineJS/mineflayer).  
It allows you to spawn multiple Minecraft bot clients to test server connections, plugin performance, and authentication flows.

> ⚠️ This tool is for **educational and server testing purposes only**.  
> Do not use it to attack or disrupt servers you do not own or have permission to test.

---

## Description
`mcLoad` is a lightweight CLI tool that connects multiple Minecraft bots to a server.  
It helps server owners and plugin developers simulate heavy player activity, including:
- Authentication plugin testing (e.g., AuthMe)
- Anti-cheat stress simulation
- Server performance under concurrent logins
- Chat and movement behavior simulation

---

## Features
- Interactive CLI configuration
- Configurable bot name prefix
- Adjustable join delay per bot
- Optional chat messages with placeholders (`{i}` for bot number)
- Optional random, human-like movement
- Optional AuthMe `/register` or `/login` commands
- Auto-reconnect with retry limit
- Real-time console logging

---

## Installation
Clone this repository and install dependencies:
```bash
git clone https://github.com/<your-username>/mcLoad.git
cd mcLoad
npm install mineflayer readline-sync
