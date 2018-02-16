const express = require('express')

var app = express()

module.exports.config = {
    persist: {
        listenPort: 3000,
        listenHost: '127.0.0.1'
    }
}

module.exports.thread = function () {
    app.listen(process.env.listenPort)
}