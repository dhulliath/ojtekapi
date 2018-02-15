//const colors = require('colors');

const consts = require('./constants.js')

const logger = function (name) {
    return {
        log: function (message, priority = consts.log.debug) {
            if (priority <= process.env.logLevel) {
                console.log('[' + name + '] ' + message);
            }
        }
    }
}

module.exports = logger;