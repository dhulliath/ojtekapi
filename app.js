const express = require('express')
const jsonfile = require('jsonfile')

//global.consts = require('constants.js')

global.ojtek = require(__dirname + '/ojtek.js');

/*ojtek.config.load()
.then(ojtek.config.save())
.then(ojtek.init())
*/
ojtek.init()