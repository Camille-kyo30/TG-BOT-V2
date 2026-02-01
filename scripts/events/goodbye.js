const nix = {
  name: "goodbye",
  description: "🛡️ Gestionnaire de sécurité : surveille les départs du groupe et journalise les événements.",
  type: "leave",
  author: "ArYAN"
};

async function onStart({ bot, msg }) {
  const chatId = msg.chat.id;
  const leftMember = msg.left_chat_member;

  try {
    if (!leftMember) return;

    const { first_name, last_name, id: userId } = leftMember;
    const fullName = `${first_name}${last_name ? ' ' + last_name : ''}`;

    const botInfo = await bot.getMe();

    // 🔐 Vérification si le bot lui-même a été retiré
    if (userId === botInfo.id) {
      const chatInfo = await bot.getChat(chatId);
      const title = chatInfo.title || 'le groupe';
      const actionBy = `${msg.from.first_name}${msg.from.last_name ? ' ' + msg.from.last_name : ''}`;

      console.log(`[ALERTE-SÉCURITÉ] Le bot a été retiré de "${title}" par ${actionBy}.`);
      return;
    }

    // 🛡️ Message d’adieu en style cybersécurité
    const goodbyeMessage = msg.from.id === userId
      ? `👋 [DÉCONNEXION] L’utilisateur "${fullName}" a quitté le canal sécurisé.` 
      : `⚠️ [EXCLUSION] L’utilisateur "${fullName}" a été supprimé par un administrateur.`; 

    await bot.sendMessage(chatId, goodbyeMessage);

    // Journalisation dans la console
    console.log(`[LOG-SÉCURITÉ] Événement de sortie : ${fullName} | ChatID: ${chatId}`);

  } catch (error) {
    console.log('[ERREUR] Dysfonctionnement du gestionnaire de sortie :', error);

    if (global.config?.admin) {
      await bot.sendMessage(
        global.config.admin[0],
        `🚨 [ERREUR-SÉCURITÉ]\nLe gestionnaire de sortie a échoué :\n${error.message}`
      );
    }
  }
};

module.exports = { nix, onStart };
