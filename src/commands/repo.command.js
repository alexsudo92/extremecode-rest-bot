const { bot } = require('./../config');

const botUrl = 'https://github.com/extremecodetv/extremecode-rest-bot';
const message = `[Информация]\r\nРепозиторий, в котором мешки с мясом производят мой апгрейд:\r\n\r\n${botUrl}`;

module.exports = (() => {
    bot.onText(/\/repo/, async (msg, match) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        await bot.sendMessage(chatId, message, {
            reply_to_message_id: messageId
        });
    });
})();
