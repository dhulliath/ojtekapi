const cluster = require('cluster')
const deepmerge = require('deepmerge')
const fs = require('fs-extra')
const randomstring = require('randomstring')
const numCPU = 1//require('os').cpus().length;

//cluster.setupMaster({exec: './worker.js'});

const ojtek = {}

ojtek.hardcoded = {
    'configfile': '.appvariables.json'
}

ojtek.workers = []

ojtek.config = {
    'gitSecret': randomstring.generate(64),
    'listenPort': 3000,
    'listenHost': '127.0.0.1'
}

ojtek.config.load = function() {
    return new Promise((resolve, reject) => {
        fs.readFile(ojtek.hardcoded.configfile)
        .then((data) => {
            var parsed = JSON.parse(data.toString('utf8'));
            ojtek.config = deepmerge(ojtek.config, parsed);
            resolve();
        })
    });
}

ojtek.config.save = function() {
    return fs.writeFile(ojtek.hardcoded.configfile, JSON.stringify(ojtek.config, null, 2));
}

ojtek.init = function() {
    if (cluster.isMaster) {
        ojtek.config.save()
        for (var i = 0; i < numCPU; i++) {
            cluster.fork(ojtek.config);
        }
    }
    if (cluster.isWorker) {
        require('./worker.js').run();
    }
}

module.exports = ojtek;