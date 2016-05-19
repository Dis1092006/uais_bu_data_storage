"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var databaseSizesRoute = router.route('/');
var databaseSizesByDateRoute = router.route('/:date');

// ---------------------------------------------------------------------------------------------------------------------
// /database-sizes
// ---------------------------------------------------------------------------------------------------------------------

// PUT
databaseSizesRoute.put(function(req, res) {
	var date = req.body.date;
	var dbms_server_name = req.body.dbms_server;
	var database_name = req.body.database;
	var file_name = req.body.file_name;
	var file_type = req.body.file_type;
	var file_size = req.body.file_size;
	var dbfilesizeshistory = models.DBFileSizesHistory.build({
		date: date,
		file_name: file_name,
		file_type: file_type,
		file_size: file_size
	});
	var dbmsServerModel = models.DBMSServer.build();
	var databaseModel = models.Database.build({name: database_name});
	
	dbmsServerModel.getByName(
		dbms_server_name,
		(dbms_servers) => {
			if ((dbms_servers) && (dbms_servers.length > 0)) {
				databaseModel.getByNameAndDBMSServer(
					database_name,
					dbms_servers[0].id,
					(databases) => {
						if ((databases) && (databases.length > 0)) {
							dbfilesizeshistory.getId(
								databases[0].id,
								(ids) => {
									if ((ids) && (ids.length > 0)) {
										dbfilesizeshistory.updateSize(
											ids[0].id,
											(result) => res.status(200).send('Ok'),
											(error) => res.status(500).send(error)
										);
									} else {
										dbfilesizeshistory.add(
											databases[0].id,
											(result) => {
												if (result) {
													res.json(result);
												} else {
													res.status(401).send("Database file size history add fail");
												}
											},
											(error) => res.status(500).send(error)
										);
									}
								},
								(error) => res.status(500).send(error)
							)
						} else {
							//res.status(401).send("Database '" + database_name + "' on DBMS server '" + dbms_server_name + "' not found");
							databaseModel.add(
								dbms_servers[0].id,
								(database) => {
									if (database) {
										dbfilesizeshistory.add(
											database.id,
											(result) => {
												if (result) {
													res.json(result);
												} else {
													res.status(401).send("Database file size history add fail");
												}
											},
											(error) => res.status(500).send(error)
										);
									} else {
										res.status(401).send("Database add fail");
									}
								},
								(error) => res.status(500).send(error)
							);
						}
					},
					(error) => res.status(500).send(error)
				);
			} else {
				res.status(401).send("DBMS server '" + dbms_server_name + "' not found");
			}
		},
		(error) => res.status(500).send(error)
	);
});

// ---------------------------------------------------------------------------------------------------------------------
// /database-sizes/:date
// ---------------------------------------------------------------------------------------------------------------------

// GET
databaseSizesByDateRoute.get(function(req, res) {
	// Контроль указания даты в параметрах либо в теле запроса.
	var date = req.params.date;
	if (date == undefined) {
		res.status(406).send("Необходимо задать дату");
	}
	else {
		var dbfilesizeshistory = models.DBFileSizesHistory.build();
		
		dbfilesizeshistory.getAllByDate(
			date,
			function(history) {
				if (history) {
					res.json(history);
				} else {
					res.status(401).send("History not found");
				}
			},
			function(error) {
				res.status(500).send(error);
			}
		);
	}
});

module.exports = router;