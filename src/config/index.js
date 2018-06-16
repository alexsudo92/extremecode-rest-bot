require('dotenv').config();

module.exports = {
    bot: require('./bot'),
    db: require('./db').development
};
