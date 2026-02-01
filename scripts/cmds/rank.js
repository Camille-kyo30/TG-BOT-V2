const nix = {
  name: "rang",
  version: "1.0.0",
  aliases: ["rank"],
  description: "Affiche le rang de l’utilisateur",
  author: "Kyo Soma",
  prefix: true,
  category: "game",
  type: "anyone",
  cooldown: 5,
  guide: "{pn}"
};

async function onStart({ message }) {
  message.reply("Votre rang actuel est : Bronze 🥉");
}

module.exports = { nix, onStart };
