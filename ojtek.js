const Promise = require('bluebird')
const cluster = require('cluster')
const deepmerge = require('deepmerge')
const fs = require('fs-extra')
const randomstring = require('randomstring')
const numCPU = require('os').cpus().length;

global.ojtek = {};

ojtek.hardcoded = {
    'configfile': '.appvariables.json'
}

ojtek.config = {}

ojtek.defConfig = {
    'logLevel': 5,
    'workerLifeMin': 1000,
    'workerLifeVar': 1000
}

ojtek.modules = []

ojtek.loadModules = function () {
    var promises = [];
    fs.readdir('./modules/').then((items) => {
        for (key in items) {
            //ojtek.modules[items[key]] = require('./modules/' + items[key])
            promises.push(
                loadModule(items[key])/*.then((modd) => {
                    ojtek.modules[items[key]] = modd;
                })*/
            );
        }
    })
    return Promise.all(promises)
}

function loadModule(modName) {
    return new Promise(function (resolve, reject) {
        try {
            var mod = require('./modules/' + modName);
            console.log('loading '+modName)
            //worker.logger.log('loaded module: ' + modName, consts.log.module);
            resolve(mod)
        } catch (err) {
            reject(err)
        }
    }).then((modd) => {
        ojtek.modules[modName] = modd
    })
}

ojtek.getModuleAttr = function (attribute) {
    return new Promise((resolve, reject) => {
        try {
            var results = []
            console.log('getting '+attribute)
            for (key in ojtek.modules) {
                if (ojtek.modules[key].hasOwnProperty(attribute)) {
                    conole.log(ojtek.modules[key])
                    results.push(ojtek.modules[key][attribute])
                }
            }
            resolve(results)
        } catch (err) {
            reject(err)
        }
    })
}

ojtek.config.load = function () {
    return ojtek.getModuleAttr('config').then((attr) => {
        try {
        var defConfig = deepmerge(attr.push(ojtek.defConfig))
        var data = fs.readFileSync(ojtek.hardcoded.configfile, 'utf8')
        var parsed = JSON.parse(data)
        ojtek.config = deepmerge(defConfig, parsed)
        resolve()
        } catch (err) {
            reject(err)
        }
    })
    /*return new Promise((resolve, reject) => {
        try {
            var defConfig = deepmerge(ojtek.getModuleAttr('config').push(ojtek.defConfig))
            var data = fs.readFileSync(ojtek.hardcoded.configfile, 'utf8')
            var parsed = JSON.parse(data);
            ojtek.config = deepmerge(defConfig, parsed);
        } catch (err) {
            console.trace('config load error')
            reject(err)
        }
        resolve();*/
    })
}

ojtek.config.save = function () {
    return fs.writeFile(ojtek.hardcoded.configfile, JSON.stringify(ojtek.config, null, 2));
}

ojtek.init = function () {
    ojtek.loadModules()
    .then(ojtek.config.load())
    .finally(function() {
        console.log(ojtek.config)
    })
}

ojtek.spawnWorker = function () {
    cluster.fork(ojtek.config)
}

cluster.on('disconnect', (worker) => {
    worker.kill()
    ojtek.spawnWorker()
})

module.exports = ojtek;