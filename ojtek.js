const cluster = require('cluster')
const deepmerge = require('deepmerge')
const fs = require('fs-extra')
const randomstring = require('randomstring')
const numCPU = require('os').cpus().length;

cluster.setupMaster({exec: './worker.js'});

//const ojtek = {}

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
    return fs.readFile(ojtek.hardcoded.configfile).then((data) => {
        var parsed = JSON.parse(data.toString('utf8'));
        ojtek.config = deepmerge(ojtek.config, parsed);
    });
}

ojtek.config.save = function() {
    return fs.writeFile(ojtek.hardcoded.configfile, JSON.stringify(ojtek.config, null, 2));
}

ojtek.init = function() {
    if (cluster.isMaster) {
        for (var i = 0; i < numCPU; i++) {
            ojtek.workers.push(cluster.fork());
        }
    }
}

module.exports = ojtek;