const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const bot = new TelegramBot("8687370941:AAF3XtUuPpO-5NZjaA_iFNzl7l0cdMO8c5s", { polling: true });

const OWNER_ID = 8286999004; // 🔐 ton ID Telegram
const FILE = "./groups.json";

// 📦 Charger les groupes
function loadGroups() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

// 💾 Sauvegarder
function saveGroups(groups) {
  fs.writeFileSync(FILE, JSON.stringify(groups, null, 2));
}

// ➕ Ajouter un groupe
function addGroup(chatId) {
  let groups = loadGroups();

  if (!groups.includes(chatId)) {
    groups.push(chatId);
    saveGroups(groups);
    console.log("📥 Groupe ajouté :", chatId);
  }
}

// 🧠 Sauvegarde automatique des groupes
bot.on("message", (msg) => {
  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    addGroup(msg.chat.id);
  }
});

// 📢 Commande broadcast sécurisée
bot.onText(/\/broadcast (.+)/, (msg, match) => {
  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(msg.chat.id, "⛔ Accès refusé.");
  }

  const text = match[1];
  const groups = loadGroups();

  groups.forEach((groupId) => {
    bot.sendMessage(groupId, "📢 Notification :\n" + text)
      .catch(() => console.log("Erreur envoi :", groupId));
  });

  bot.sendMessage(msg.chat.id, "✅ Message envoyé à tous les groupes !");
});
