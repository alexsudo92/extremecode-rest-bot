const { Logger } = require('./util');
const { bot } = require('./config');
const { sequelize } = require('./models');
const { Stats } = require('./handlers');

const log = Logger(module);

module.exports = (async () => {
    await sequelize.sync();
    require('./commands').init();

    bot.on('message', async (msg) => {
        await Stats(msg.from);
    });

    log.debug('Application started');
})();
