"use strict";
var express = require('express');
var router = express.Router();
var internalMonitoringData = require('../models/internal-monitoring-data');

router.get('/', function (req, res, next) {
	res.json({message: 'Get is working!'});
});

// Internal monitoring data
var imdRoute = router.route('/imd');

// Create endpoint /imd for POST
imdRoute.post(function (req, res) {
	var imd = new internalMonitoringData();
	var time, duration, address, status, error;

    //// текущая дата
    //var now = new Date().toISOString();

	// Разбор полученных данных.
	time = req.body.time;
	duration = req.body.duration;
	address = req.body.address;
	status = req.body.status;
	error = req.body.error;

    // Контроль показателей.
    if (time === null ||duration === null || address === null || status === null) {
        res.json({message: "Некорректные данные!"});
        console.log("Некорректные данные!");
        console.log(req.body);
    }
    else if (time === "") {
        res.json({message: "Некорректные показатели времени в данных!"});
        console.log("Некорректные показатели времени в данных!");
        console.log(req.body);
    }
    else {
        var result = imd.add(time, duration, address, status, error, function (result) {
            res.json({message: result});
        });
    }
});

// Create endpoint /imd for GET
imdRoute.get(function (req, res) {
	var imd = new internalMonitoringData();
	var result = imd.get_current(function (result) {
		res.json({message: result});
	});
});


module.exports = router;
