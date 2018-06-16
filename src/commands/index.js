exports.init = () => {
    const commands = require('require-all')({
        dirname: __dirname,
        filter: /(.+command)\.js$/
    });
};
