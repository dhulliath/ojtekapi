const express = require('express')
const jsonfile = require('jsonfile')
const randomstring = require('randomstring')
const fs = require('fs')

var ojtek = {
    app: express(),
    files: {
        'variables': '.appvariables.json',
        'unixsocket': '/var/run/ojtekapi.sock'
    },
    config: {},
    loadVariables: function() {
        jsonfile.readFile(ojtek.files.variables, (err, obj) => {
            if (err) {
                console.log('no variable file; generating')
                ojtek.config = {
                    'gitSecret': randomstring.generate(64),
                    'listenPort': 3000
                }
                ojtek.saveVariables()
            } else {
                ojtek.config = obj
            }
        })
    },
    saveVariables: function() {
        jsonfile.writeFile(ojtek.files.variables, ojtek.config)
    }
}

//load config variables
ojtek.loadVariables()

//load modules
var normalizedPath = require("path").join(__dirname, "modules");
fs.readdirSync(normalizedPath).forEach(function(file) {
    console.log('loading module: ' + file)
    require("./modules/" + file).init(ojtek);
});

//create git update loader

if (!Number.isInteger(ojtek.config.listenPort)) {
    fs.unlink(ojtek.config.listenPort)
}
ojtek.app.listen(ojtek.config.listenPort, () => {
    console.log('server is listening')
})