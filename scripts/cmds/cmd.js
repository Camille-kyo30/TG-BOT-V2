const axios = require('axios');
const fs = require('fs');
const path = require('path');

const nix = {
  name: "cmd",
  version: "1.0.1",
  aliases: [],
  description: "Installe ou télécharge une nouvelle commande via un lien ou du texte.",
  author: "Camille",
  prefix: true,
  category: "admin",
  type: "admin",
  cooldown: 5,
  guide: "/cmd [nom_du_fichier] [url]\nOu répondez à un message contenant du code avec : /cmd [nom_du_fichier]"
};

async function onStart({ api, message, event, args }) {
  const bot = api;
  const msg = message;
  const fileName = args[0];

  if (!fileName) {
    return msg.reply("⚠️ Veuillez spécifier un nom pour le fichier (ex: test).");
  }

  let content = "";

  try {
    // Vérification si l'utilisateur répond à un message (event.reply_to_message)
    const targetMessage = event.reply_to_message;

    if (targetMessage && targetMessage.text) {
      // Cas 1 : Récupération du texte depuis un message auquel on répond
      content = targetMessage.text;
    } 
    else if (args[1] && args[1].startsWith("http")) {
      // Cas 2 : Récupération depuis une URL fournie
      const response = await axios.get(args[1]);
      if (typeof response.data === 'object') {
        content = JSON.stringify(response.data, null, 2);
      } else {
        content = response.data;
      }
    } 
    else {
      return msg.reply("⚠️ Vous devez soit répondre à un message contenant du code, soit fournir un lien URL direct (Raw).");
    }

    // Nettoyage du nom de fichier pour éviter les injections de chemin
    const cleanFileName = fileName.replace(/[\\/:*?"<>|]/g, "");
    const safeFileName = cleanFileName.endsWith(".js") ? cleanFileName : `${cleanFileName}.js`;
    
    // Le chemin pointera vers le dossier actuel des commandes
    const filePath = path.join(__dirname, safeFileName);

    // Écriture du fichier sur le disque en UTF-8
    fs.writeFileSync(filePath, content, 'utf-8');

    return msg.reply(`✅ La commande "${safeFileName}" a été installée avec succès.\n\nNote : Un redémarrage du bot ou une commande de rechargement est nécessaire pour activer ce nouveau fichier.`);

  } catch (error) {
    console.error("Erreur lors de l'exécution de cmd:", error);
    return msg.reply(`❌ Une erreur est survenue lors de l'installation : ${error.message}`);
  }
}

module.exports = { 
  config: nix,
  nix, 
  onStart 
};
