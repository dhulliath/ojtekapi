const cluster = require('cluster')
const deepmerge = require('deepmerge')
const fs = require('fs-extra')
const randomstring = require('randomstring')
const numCPU = require('os').cpus().length;

const ojtek = {};

ojtek.hardcoded = {
    'configfile': '.appvariables.json'
}

ojtek.config = {
    'gitSecret': randomstring.generate(64),
    'listenPort': 3000,
    'listenHost': '127.0.0.1',
    'logLevel': 5,
    'workerLifeMin': 1000,
    'workerLifeVar': 1000
}

ojtek.config.load = function () {
    return new Promise((resolve, reject) => {
        try {
            var data = fs.readFileSync(ojtek.hardcoded.configfile, 'utf8')
            var parsed = JSON.parse(data);
            ojtek.config = deepmerge(ojtek.config, parsed);
        } catch (err) {
            console.trace('config load error')
            reject(err)
        }
        resolve();
    });
}

ojtek.config.save = function () {
    return fs.writeFile(ojtek.hardcoded.configfile, JSON.stringify(ojtek.config, null, 2));
}

ojtek.init = function () {
    if (cluster.isMaster) {
        cluster.setupMaster({
            exec: './worker.js'
        })
        for (var i = 0; i < numCPU; i++) {
            ojtek.spawnWorker()
        }
    }
}

ojtek.spawnWorker = function () {
    cluster.fork(ojtek.config)
}

cluster.on('message', (worker, message, handle) => {
    if (message.type == 'command') {
        if (message.command == 'exit') {
            process.exit()
        }
    }
})
cluster.on('disconnect', (worker) => {
    ojtek.spawnWorker()
})

module.exports = ojtek;