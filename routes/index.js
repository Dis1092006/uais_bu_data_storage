"use strict";
var express = require('express');
var router = express.Router();
var internalMonitoringData = require('../models/internal-monitoring-data')

router.get('/', function (req, res, next) {
	res.json({message: 'Running!'});
});

// Internal monitoring data
var imdRoute = router.route('/imd');

// Create endpoint /imd for POSTS
imdRoute.post(function (req, res) {
	var imd = new internalMonitoringData();

	//console.log(req.body.url);
	//console.log(req.body.status);
	//console.log(req.body.error);

	// текущая дата
	var now = new Date().toISOString();
	console.log(now);

	var result = imd.add(now, "http://172.16.241.1/SM/ws/RemoteControl", 200, "", function (result) {
		res.json({message: result});
	});
});


module.exports = router;
