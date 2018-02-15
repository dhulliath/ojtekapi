//const colors = require('colors');

const logger = function(name) {
    return {
        log: function(message) {
        console.log('['+name+'] '+message);}
    }
}

module.exports = logger;