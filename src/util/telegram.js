const { bot } = require('./../config');

exports.isAdmin = async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const admins = await bot.getChatAdministrators(chatId).map(e => e.user.id);
    return admins.includes(userId);
};

exports.isChatMessage = (msg) => {
    return msg.from.id !== msg.chat.id;
};
