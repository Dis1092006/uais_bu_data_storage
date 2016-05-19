"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var lastBackupsRoute = router.route('/last');
var todayBackupsRoute = router.route('/today');
var allBackupsRoute = router.route('/all');

// ---------------------------------------------------------------------------------------------------------------------
// /backups/last
// ---------------------------------------------------------------------------------------------------------------------

// PUT
lastBackupsRoute.put(function (req, res) {
	var file_name = req.body.file_name;
	var database_id = req.body.database_id;
	var backup_date = req.body.backup_date;
	var backup_type = req.body.backup_type;
	var backup_size = req.body.backup_size;
	var lastBackup = models.LastBackup.build({
		file_name: file_name,
		backup_date: backup_date,
		backup_type: backup_type,
		backup_size: backup_size
	});
	
	lastBackup.getByDatabaseId(
		database_id,
		(backups) => {
			if ((backups) && (backups.length > 0)) {
				lastBackup.update(
					database_id,
					(result) => {
						if (result) {
							res.json(result);
						} else {
							res.status(401).send("Last backup update fail");
						}
					},
					(error) => res.status(500).send(error)
				);
			} else {
				lastBackup.add(
					database_id,
					(result) => {
						if (result) {
							res.json(result);
						} else {
							res.status(401).send("Last backup add fail");
						}
					},
					(error) => res.status(500).send(error)
				);
			}
		},
		(error) => res.status(500).send(error)
	);
});

// GET
lastBackupsRoute.get(function (req, res) {
	var lastBackup = models.LastBackup.build();
	
	lastBackup.getAll(
		function(backups) {
			if (backups) {
				res.json(backups);
			} else {
				res.status(401).send("Backups not found");
			}
		},
		function(error) {
			res.status(500).send(error);
		}
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /backups/today
// ---------------------------------------------------------------------------------------------------------------------

// GET
todayBackupsRoute.get(function (req, res) {
	res.send("Under construction"); // ToDo /backups/today
});

// ---------------------------------------------------------------------------------------------------------------------
// /backups/all
// ---------------------------------------------------------------------------------------------------------------------

// GET
allBackupsRoute.get(function (req, res) {
	res.send("Under construction"); // ToDo /backups/all
});

module.exports = router;