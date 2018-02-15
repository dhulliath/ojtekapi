const cluster = require('cluster')
const deepmerge = require('deepmerge')
const fs = require('fs-extra')
const randomstring = require('randomstring')
const numCPU = 1//require('os').cpus().length;

const ojtek = {};

ojtek.hardcoded = {
    'configfile': '.appvariables.json'
}

ojtek.config = {
    'gitSecret': randomstring.generate(64),
    'listenPort': 3000,
    'listenHost': '127.0.0.1'
}
    
ojtek.config.load = function() {
    return new Promise((resolve, reject) => {
        try {
        var parsed = JSON.parse(fs.readFileSync(ojtek.hardcoded.configfile, 'utf8'));
        ojtek.config = deepmerge(ojtek.config, parsed);
        } catch (err) {
            console.trace()
            reject(err)
        }
        resolve();
    });
}

ojtek.config.save = function() {
    return fs.writeFile(ojtek.hardcoded.configfile, JSON.stringify(ojtek.config, null, 2));
}

ojtek.init = function() {
    if (cluster.isMaster) {
        cluster.setupMaster({
            exec: './worker.js'
        })
        //ojtek.config.save()
        for (var i = 0; i < numCPU; i++) {
            cluster.fork(ojtek.config);
        }
    }
    /*if (cluster.isWorker) {
        require('./worker.js').run();
    }*/
}

cluster.on('message', (worker, message, handle) => {
    if (message.type == 'command') {
        if (message.command == 'exit') {
            process.exit()
        }
    }
})

module.exports = ojtek;