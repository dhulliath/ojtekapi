const express = require('express')
const jsonfile = require('jsonfile')
const randomstring = require('randomstring')
const fs = require('fs')
const sync = require('sync')

var ojtek = {
    app: express(),
    files: {
        'variables': '.appvariables.json',
        'unixsocket': '/var/run/ojtekapi.sock'
    },
    config: {
        'gitSecret': randomstring.generate(64),
        'listenPort': 3000
    },
    loadVariables: function () {
        jsonfile.readFile(ojtek.files.variables, (err, obj) => {
            if (err) {
                console.log('no variable file; generating')
                ojtek.saveVariables()
            } else {
                ojtek.config = obj
            }
        })
    },
    saveVariables: function () {
        jsonfile.writeFile(ojtek.files.variables, ojtek.config)
    },
    openServer: function () {
        if (isNaN(parseInt(ojtek.config.listenPort))) {
            fs.stat(ojtek.config.listenPort, function (err) {
                if (!err) {
                    fs.unlinkSync(ojtek.config.listenPort)
                }
                ojtek.app.listen(ojtek.config.listenPort, () => {
                    fs.chmodSync(ojtek.config.listenPort, '775')
                    console.log('server is listening on ' + ojtek.config.listenPort)
                })
            })
        } else {
            ojtek.app.listen(ojtek.config.listenPort, () => {
                console.log('server is listening on ' + ojtek.config.listenPort)
            })
        }
    },
    loadModules: function () {
        var normalizedPath = require("path").join(__dirname, "modules");
        fs.readdirSync(normalizedPath).forEach(function (file) {
            console.log('loading module: ' + file)
            require("./modules/" + file).init(ojtek);
        });
    },
    start: function () {
        sync(ojtek.loadVariables())
        sync(ojtek.loadModules())
        sync(ojtek.openServer())
    }
}

ojtek.start()