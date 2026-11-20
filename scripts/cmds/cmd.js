const axios = require('axios');
const fs = require('fs');
const path = require('path');

const config = {
  name: "cmd",
  version: "1.1.2",
  author: "Camille",
  countDown: 5,
  role: 2,
  description: {
    en: "Installe, recharge ou désactive une commande (install, load, unload)."
  },
  category: "admin",
  guide: {
    en: "/cmd install [nom] [url/reply]\n/cmd load [nom] [url/reply]\n/cmd unload [nom]"
  },
  aliases: [],
  prefix: true
};

async function onStart({ api, message, event, args }) {
  const decoration = {
    line: "━━━━━━━━━━━━━━━━━━",
    header: "╭────────────╮\n│ 📂 SYSTÈME CMD\n╰────────────╯",
    success: "✅",
    error: "❌",
    info: "⚠️",
    bullet: "✨"
  };

  try {
    const action = args[0]?.toLowerCase();
    
    if (!action || !["install", "load", "unload"].includes(action)) {
      return message.reply(`${decoration.header}\n${decoration.line}\n${decoration.info} *Utilisation :*\n${decoration.bullet} /cmd install [nom] [url/reply]\n${decoration.bullet} /cmd load [nom] [url/reply]\n${decoration.bullet} /cmd unload [nom]\n${decoration.line}`);
    }

    const fileName = args[1];
    const url = args[2];

    if (!fileName) {
      return message.reply(`${decoration.error} Veuillez spécifier un nom de fichier.`);
    }

    // Sécurisation du nom de fichier
    const cleanFileName = fileName.replace(/[\\/:*?"<>|]/g, "");
    const safeFileName = cleanFileName.endsWith(".js") ? cleanFileName : `${cleanFileName}.js`;
    const filePath = path.join(__dirname, safeFileName);

    // ACTION : UNLOAD (Désactiver)
    if (action === "unload") {
      if (!fs.existsSync(filePath)) {
        return message.reply(`${decoration.error} Le fichier ‹ ${safeFileName} › n'existe pas.`);
      }
      
      const backupPath = filePath + ".bak";
      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath); 
      
      fs.renameSync(filePath, backupPath);
      
      try {
        const resolvedPath = path.resolve(filePath);
        if (require.cache[resolvedPath]) {
          delete require.cache[resolvedPath];
        }
      } catch (e) {}

      return message.reply(`${decoration.header}\n${decoration.line}\n${decoration.success} Commande : ‹ ${safeFileName} ›\n${decoration.bullet} Statut : Désactivée (.bak)\n${decoration.line}`);
    }

    // ACTION : LOAD ou INSTALL
    let content = "";
    const targetMessage = event.reply_to_message || null;

    // Si on veut recharger un fichier local existant (sans URL ni Reply)
    if (action === "load" && !url && !targetMessage) {
      if (!fs.existsSync(filePath)) {
        return message.reply(`${decoration.error} Le fichier ‹ ${safeFileName} › est introuvable sur le disque.`);
      }
      try {
        const resolvedPath = path.resolve(filePath);
        if (require.cache[resolvedPath]) {
          delete require.cache[resolvedPath];
        }
        return message.reply(`${decoration.header}\n${decoration.line}\n${decoration.success} Cache vidé : ‹ ${safeFileName} ›\n${decoration.info} Redémarrez pour appliquer.\n${decoration.line}`);
      } catch (e) {
        return message.reply(`${decoration.error} Erreur cache : ${e.message}`);
      }
    }

    // Récupération du contenu du code
    if (targetMessage && (targetMessage.text || targetMessage.caption)) {
      content = targetMessage.text || targetMessage.caption;
    } else if (url && url.startsWith("http")) {
      const response = await axios.get(url);
      content = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data;
    } else {
      return message.reply(`${decoration.info} Répondez à un message contenant du code ou fournissez un lien URL valide.`);
    }

    if (!content || content.trim() === "") {
      return message.reply(`${decoration.error} Le contenu récupéré est vide.`);
    }

    // Écriture du fichier sur le disque
    fs.writeFileSync(filePath, content, 'utf-8');

    // Nettoyage du cache require pour le fichier spécifié
    try {
      const resolvedPath = path.resolve(filePath);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
    } catch (e) {}

    const successType = action === 'install' ? 'Installée' : 'Mise à jour';
    return message.reply(`${decoration.header}\n${decoration.line}\n${decoration.success} Commande : ‹ ${safeFileName} ›\n${decoration.bullet} Action : ${successType}\n${decoration.info} Note : Redémarrage requis.\n${decoration.line}`);

  } catch (error) {
    console.error("Erreur commande cmd:", error);
    return message.reply(`${decoration.error} **Erreur Système** :\n${error.message}`);
  }
}

module.exports = {
  config,
  onStart
};
