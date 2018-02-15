const cluster = require('cluster')
const express = require('express')
const fs = require('fs-extra')

const worker = {}

worker.app = express();

worker.logger = require('./logger.js')(process.pid)

worker.loadModules = function() {
    var promises = [];
    fs.readdir('./modules/').then((items) => {
        for (key in items) {
            promises.push(worker.loadModule(items[key]));
        }
    })
    return Promise.all(promises)
}

worker.loadModule = function(modName) {
    return new Promise(function (resolve, reject) {
        try {
            var mod = require('./modules/' + modName);
            worker.logger.log('loaded module: ' + modName);
            mod.init(worker);
        } catch (err) {
            reject(err);
        }
        resolve();
    });
}

worker.run = function() {
    
    worker.loadModules();
    worker.app.listen(process.env.listenPort);
    worker.logger.log('spawned worker')
}

worker.run();

module.exports = worker;