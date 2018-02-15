const express = require('express')
const jsonfile = require('jsonfile')

global.ojtek = require(__dirname + '/ojtek.js');

ojtek.init()