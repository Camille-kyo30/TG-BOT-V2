const nix = {
  name: "guessnumber",
  version: "1.0.0",
  aliases: ["gn"],
  description: "Devine un nombre entre 1 et 100",
  author: "Kyo soma",
  prefix: true,
  category: "game",
  type: "anyone",
  cooldown: 5,
  guide: "{pn} <nombre>"
};

async function onStart({ bot, args, message }) {
  if (!args[0]) return message.reply("Entrez un nombre.");
  const target = Math.floor(Math.random() * 100) + 1;
  const guess = parseInt(args[0]);
  if (guess === target) message.reply("🎉 Bravo, c'était le bon nombre !");
  else message.reply("❌ Mauvais nombre. C'était " + target);
}

module.exports = { nix, onStart };
