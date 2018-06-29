const { Logger } = require('./util');
const { isAdmin, isChatMessage } = require('./util/telegram');
const { bot } = require('./config');
const { sequelize } = require('./models');
const { Stats } = require('./handlers');

const log = Logger(module);

module.exports = (async () => {
    await sequelize.sync();
    require('./commands').init();

    bot.on('message', async (msg) => {
        if (isChatMessage(msg)) {
            const admin = await isAdmin(msg);
            msg.from.is_admin = admin;

            if (!msg.from.username) {
                await bot.sendMessage(msg.chat.id, 'Мешок с мясом должен иметь имя!', {
                    reply_to_message_id: msg.message_id
                });
                return;
            }

            await Stats(msg);
        }
    });

    log.debug('Application started');
})();

process.on('uncaughtException', (error) => {
    log.error(error);
});
