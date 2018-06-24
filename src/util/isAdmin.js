const { bot } = require('./../config');
//TODO: Переделать все это
exports.isAdmin = async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const admins = await bot.getChatAdministrators(chatId);
    for (let i = 0; i < admins.length; i += 1) {
        if (admins[i].user.id === userId) {
            return true;
        }
    }

    return false;
};
