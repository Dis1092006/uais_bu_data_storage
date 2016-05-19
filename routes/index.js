"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	res.json({message: 'Get is working!'});
});

module.exports = router;