const cluster = require('cluster')
const express = require('express')
const fs = require('fs-extra')

const worker = {}

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
            console.log(process.pid + ' loaded: ' + modName);
            mod.init(worker);
        } catch (err) {
            reject(err);
        }
        resolve();
    });
}

worker.run = function() {
    worker.app = express();
    worker.loadModules();
}

module.exports = worker;