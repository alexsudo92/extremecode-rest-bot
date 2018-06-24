// TODO: Пофиксить импорты
const { Logger } = require('./util');
const { isAdmin } = require('./util/isAdmin');
const { bot } = require('./config');
const { sequelize } = require('./models');
const { Stats } = require('./handlers');

const log = Logger(module);

module.exports = (async () => {
    await sequelize.sync();
    require('./commands').init();

    bot.on('message', async (msg) => {
        if (msg.text) {
            if (msg.from.id !== msg.chat.id) {
                const admin = await isAdmin(msg);
                msg.from.is_admin = admin;
            }

            if (msg.from.username === '' || !msg.from.username) {
                await bot.sendMessage(msg.chat.id, 'Мешок с мясом должен иметь имя!', {
                    reply_to_message_id: msg.message_id
                });
                return;
            }
            //TODO: Старая информация о пользователе не обновляется, обновлять каждые 30 минут
            await Stats(msg.from);
        }
    });

    log.debug('Application started');
})();
