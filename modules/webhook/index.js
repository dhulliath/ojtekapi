const cluster = require('cluster')
const randomstring = require('randomstring')

module.exports.config = {
    persist: {
        gitSecret: randomstring.generate(64)
    }
}

module.exports.master = function() {
    cluster.on('message', (worker, message, handle) => {
        if (message.type == 'command') {
            if (message.command == 'exit') {
                process.exit()
            }
        }
    })
}

module.exports.express = function (app) {
    app.get('/webhook/git/', (req, res) => {
        ojtek.logger.log('git update request received')
        if (req.query.key == process.env.gitSecret) {
            res.send('ok')
            process.send({
                type: 'command',
                command: 'exit'
            })
        }
        res.send()

    })
}