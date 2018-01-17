module.exports = {
    init: function (ojtek) {
        ojtek.app.get('/webhook/git/', (req, res) => {
            console.log('git update request received')
            if (req.query.key == ojtek.config.gitSecret) {
                res.send('ok')
                console.log('request valid; exiting process')
                process.exit()
            }
            res.send()
        })
    }
}