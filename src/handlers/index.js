const { transformObject } = require('./../util').Transform;
const handlers = require('require-all')({
    dirname: __dirname,
    filter: /(.+handler)\.js$/
});

module.exports = transformObject(handlers);
