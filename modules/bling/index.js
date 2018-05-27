const ojmodule = {}

ojmodule.init = function(worker) {
    worker.app.get('/bling/', (req, res) => {
        //worker.logger.log("blinged " + worker.ttl)
        res.send(`${process.pid}: ${worker.ttl}`)

        worker.increment();
    })
}

module.exports = ojmodule;