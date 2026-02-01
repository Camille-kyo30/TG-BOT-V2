const nix = {
  name: "redémarrer",
  version: "1.0.0",
  aliases: ["restart"],
  description: "Redémarre le bot",
  author: "Kyo soma",
  prefix: true,
  category: "system",
  type: "admin",
  cooldown: 5,
  guide: "{pn}"
};

async function onStart({ message }) {
  message.reply("🔄 Redémarrage en cours...");
  process.exit(1);
}

module.exports = { nix, onStart };
