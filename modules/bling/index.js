const ojmodule = {}

ojmodule.express = function(app) {
    app.get('/bling/', (req, res) => {
        res.send('bedazzle')
    })
}

module.exports = ojmodule;