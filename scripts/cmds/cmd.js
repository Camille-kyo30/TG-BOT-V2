const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "cmd",
    version: "1.0.0",
    author: "Camille",
    countDown: 5,
    role: 2,
    description: {
      en: "Installe ou télécharge une nouvelle commande via un lien ou du texte."
    },
    category: "admin",
    guide: {
      en: "/cmd [nom_du_fichier] [url]\nOu répondez à un message contenant du code avec : /cmd [nom_du_fichier]"
    }
  },

  onStart: async function ({ message, event, args }) {
    const fileName = args[0];

    if (!fileName) {
      return message.reply("⚠️ Veuillez spécifier un nom pour le fichier (ex: test).");
    }

    let content = "";

    try {
      // Cas 1 : Réponse à un message contenant du code
      if (event.reply_to_message && event.reply_to_message.text) {
        content = event.reply_to_message.text;
      } 
      // Cas 2 : URL fournie en argument
      else if (args[1] && args[1].startsWith("http")) {
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
      const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, "") + ".js";
      const filePath = path.join(__dirname, safeFileName);

      // Écriture du fichier
      fs.writeFileSync(filePath, content, 'utf-8');

      return message.reply(`✅ La commande "${safeFileName}" a été installée avec succès.\n\nNote : Vous devrez peut-être redémarrer le bot ou utiliser une commande de rechargement si disponible pour l'activer.`);

    } catch (error) {
      console.error(error);
      return message.reply(`❌ Une erreur est survenue lors de l'installation : ${error.message}`);
    }
  }
};
