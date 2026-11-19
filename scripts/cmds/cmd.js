const axios = require('axios');
const fs = require('fs');
const path = require('path');

const nix = {
  name: "cmd",
  version: "1.0.4",
  author: "Camille",
  countDown: 5,
  role: 2,
  description: {
    en: "Installe ou télécharge une nouvelle commande via un lien ou du texte."
  },
  category: "admin",
  guide: {
    en: "/cmd [nom_du_fichier] [url]\nOu répondez à un message contenant du code avec : /cmd [nom_du_fichier]"
  },
  aliases: [],
  prefix: true,
  type: "admin"
};

async function onStart({ api, message, event, args }) {
  const fileName = args[0];

  if (!fileName) {
    return message.reply("⚠️ Veuillez spécifier un nom pour le fichier (ex: test).");
  }

  let content = "";

  try {
    // Sécurisation maximale de l'accès à reply_to_message pour Telegram
    // On vérifie event, puis message (le wrapper de GoatBot)
    let targetMessage = null;
    if (event && event.reply_to_message) {
      targetMessage = event.reply_to_message;
    } else if (message && message.reply_to_message) {
      targetMessage = message.reply_to_message;
    }

    if (targetMessage && (targetMessage.text || targetMessage.caption)) {
      // Cas 1 : Récupération du texte depuis un message auquel on répond
      content = targetMessage.text || targetMessage.caption;
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
      return message.reply("⚠️ Vous devez soit répondre à un message contenant du code, soit fournir un lien URL direct (Raw).");
    }

    if (!content || content.trim() === "") {
      return message.reply("❌ Le contenu récupéré est vide.");
    }

    // Nettoyage du nom de fichier pour éviter les injections de chemin
    const cleanFileName = fileName.replace(/[\\/:*?"<>|]/g, "");
    const safeFileName = cleanFileName.endsWith(".js") ? cleanFileName : `${cleanFileName}.js`;
    
    // Le chemin pointera vers le dossier actuel des commandes
    const filePath = path.join(__dirname, safeFileName);

    // Écriture du fichier sur le disque en UTF-8
    fs.writeFileSync(filePath, content, 'utf-8');

    return message.reply(`✅ La commande "${safeFileName}" a été installée avec succès.\n\nNote : Un redémarrage du bot est nécessaire pour charger ce nouveau fichier.`);

  } catch (error) {
    console.error("Erreur lors de l'exécution de cmd:", error);
    return message.reply(`❌ Une erreur est survenue lors de l'installation : ${error.message}`);
  }
}

module.exports = { 
  config: nix,
  nix, 
  onStart 
};
        
