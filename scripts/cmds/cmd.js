const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Structure de commande pour GoatBot V2 Telegram
 * Le loader attend un objet "config" et une fonction "onStart"
 */
const config = {
  name: "cmd",
  version: "1.0.0",
  author: "Camille",
  countDown: 5,
  role: 2, // Admin uniquement
  description: {
    en: "Installe ou télécharge une nouvelle commande via un lien ou du texte."
  },
  category: "admin",
  guide: {
    en: "/cmd [nom_du_fichier] [url]\nOu répondez à un message contenant du code avec : /cmd [nom_du_fichier]"
  }
};

/**
 * Fonction principale déclenchée au démarrage de la commande
 * @param {object} context - Contient message, event, args, api, etc.
 */
async function onStart({ message, event, args, api }) {
  const fileName = args[0];

  if (!fileName) {
    return message.reply("⚠️ Veuillez spécifier un nom pour le fichier (ex: test).");
  }

  let content = "";

  try {
    // Vérification si l'utilisateur répond à un message (event.reply_to_message)
    const targetMessage = event.reply_to_message;

    if (targetMessage && targetMessage.text) {
      // Cas 1 : Récupération du texte depuis un message répondu
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
      return message.reply("⚠️ Vous devez soit répondre à un message contenant du code, soit fournir un lien URL direct (Raw).");
    }

    // Nettoyage du nom de fichier pour éviter les injections de chemin
    const cleanFileName = fileName.replace(/[\\/:*?"<>|]/g, "");
    const safeFileName = cleanFileName.endsWith(".js") ? cleanFileName : `${cleanFileName}.js`;
    
    // Le chemin pointera vers le dossier actuel des commandes
    const filePath = path.join(__dirname, safeFileName);

    // Écriture du fichier sur le disque en UTF-8
    fs.writeFileSync(filePath, content, 'utf-8');

    return message.reply(`✅ La commande "${safeFileName}" a été installée avec succès.\n\nNote : Un redémarrage du bot ou une commande de rechargement est nécessaire pour activer ce nouveau fichier.`);

  } catch (error) {
    console.error(error);
    return message.reply(`❌ Une erreur est survenue lors de l'installation : ${error.message}`);
  }
}

module.exports = {
  config,
  onStart
};
