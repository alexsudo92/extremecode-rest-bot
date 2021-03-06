const moment = require('moment');
const { bot } = require('./../config');
const { Rest } = require('./../config').chats;
const {
    allowFor
} = require('./../util/telegram');

moment.locale('ru');

module.exports = (() => {
    let lastTime = moment();
    bot.on('message', async (msg) => {
        if (!allowFor(Rest)) {
            return;
        }

        if (msg.pinned_message) {
            lastTime = moment();
        }
    });

    bot.onText(/\/lastpin/, async (msg, match) => {
        if (!allowFor(Rest)) {
            return;
        }

        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        const delta = moment().diff(moment(lastTime));
        const duration = moment.duration(delta);
        const humanized = duration.humanize();

        const message = `[Информативно] 
Мешки с мясом из группировки 'Администраторы' в последний раз закрепляли сообщение ${humanized} назад`;

        await bot.sendMessage(chatId, message, {
            reply_to_message_id: messageId
        });
    });
})();
