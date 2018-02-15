const cluster = require('cluster')

const ojmodule = {}

ojmodule.init = function (ojtek) {
    ojtek.app.get('/webhook/git/', (req, res) => {
        ojtek.logger.log('git update request received')
        if (req.query.key == process.env.gitSecret) {
            res.send('ok')
            ojtek.logger.log('request valid; sending exit/update command')
            process.send({type:'command',command:'exit'})
        }
        res.send()
    })
}

module.exports = ojmodule