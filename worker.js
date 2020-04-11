const cluster = require('cluster')
const express = require('express')
const fs = require('fs-extra')
const cors = require('cors')

global.consts = require('./constants.js')

const worker = {}

worker.app = express();
//worker.app.use(cors())

worker.end = false

worker.logger = require('./logger.js')(process.pid)

worker.ttl = parseInt(process.env.workerLifeMin) + Math.floor(Math.random() * parseInt(process.env.workerLifeVar))

worker.increment = function() {
    worker.ttl--
    if (worker.ttl <= 0 && worker.end == false ) {
        worker.end = true
        worker.endWorker()
    }
}

/*worker.app.use(function (req, res, next) {
    //worker.ttl--
    next()
  })*/

worker.endWorker = function() {
    worker.logger.log('ending worker', consts.log.info)
    cluster.worker.disconnect()
}

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
            worker.logger.log('loaded module: ' + modName, consts.log.module);
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
    worker.logger.log('spawned worker, life of: ' + worker.ttl, consts.log.info)
}

worker.run();

module.exports = worker;