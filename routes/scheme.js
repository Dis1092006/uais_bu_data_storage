"use strict";
var models = require('../models');
var express = require('express');
var router = express.Router();

var schemeRoute = router.route('/');
var schemeTableRoute = router.route('/table');

// ---------------------------------------------------------------------------------------------------------------------
// /scheme
// ---------------------------------------------------------------------------------------------------------------------

// GET
schemeRoute.get(function (req, res) {
	var zone = models.Zone.build();
	
	zone.getScheme()
		.then(result => res.json(result))
		.catch(error => res.status(500).send(error));
});

// ---------------------------------------------------------------------------------------------------------------------
// /scheme/table
// ---------------------------------------------------------------------------------------------------------------------

// GET
schemeTableRoute.get(function (req, res) {
	var zone = models.Zone.build();
	var currentZone;
	var currentNode;
	var currentDatabase;
	var currentServer;
	
	var searchByName = function (array, name) {
		let result = null;
		array.forEach(item => {
			if (item.name === name) {
				result = item;
			}
		});
		return result;
	};
	
	// Вывести дату в формате dd.MM.yyyy
	var formatDate = function (date)  {
		return [
			date.getDate(),
			date.getMonth() + 1,
			date.getFullYear()
		].map(function(val){
			return val < 10 ? '0' + val : val;
		}).join('.');
	};
	
	zone.getScheme()
		.then(result => {
			let scheme = {
				zones: []
			};
			result.forEach(record => {
				currentZone = searchByName(scheme.zones, record.zone);
				if (!currentZone) {
					currentZone = {
						name: record.zone,
						nodes: []
					};
					scheme.zones.push(currentZone);
				}
				currentNode = searchByName(currentZone.nodes, record.node);
				if (!currentNode) {
					currentNode = {
						name: record.node,
						web_1: "",
						web_2: "",
						app_1: "",
						app_2: "",
						app_3: "",
						app_lic: "",
						db_1: "",
						db_2: "",
						databases: []
					};
					currentZone.nodes.push(currentNode);
				}
				if (record.database_name) {
					currentDatabase = searchByName(currentNode.databases, record.database_name);
					if (!currentDatabase) {
						currentDatabase = record.database_name;
						currentNode.databases.push(currentDatabase);
					}
				}
				switch (record.server_alias.toUpperCase()) {
					case "WEB-1":
						currentNode.web_1 = record.server_name;
						break;
					case "WEB-2":
						currentNode.web_2 = record.server_name;
						break;
					case "APP-1":
						currentNode.app_1 = record.server_name;
						break;
					case "APP-2":
						currentNode.app_2 = record.server_name;
						break;
					case "APP-3":
						currentNode.app_3 = record.server_name;
						break;
					case "APP-LIC":
						currentNode.app_lic = record.server_name;
						break;
					case "DB-1":
						currentNode.db_1 = record.server_name;
						break;
					case "DB-2":
						currentNode.db_2 = record.server_name;
				}
			});
			
			let resultTable = "<!DOCTYPE html>";
			resultTable += "<style>body{font-size:11px} .grey{background-color: #D8D8D8;} .yellow{background-color: #EDFF7F;} .white{background-color: #FFFFFF;} .green{background-color: #AFFEAF;} .red{background-color: #FEA5A5;}</style>";
			resultTable += "<h3>Ноды-базы УАИСБУ (" + formatDate(new Date()) + ")</h3>";
			resultTable += "<table width='100%' border='1' style='border-spacing: 0px;'>";
			resultTable += "<tr class='grey'>";
			resultTable += "<td>Зона</td><td>Нода</td><td>Базы</td>";
			for (let j = 1; j <= 2; j++) {
				resultTable += "<td style='width:250px'>WEB-?-" + j + "</td>";
			}
			for (let j = 1; j <= 3; j++) {
				resultTable += "<td style='width:250px'>APP-?-" + j + "</td>";
			}
			resultTable += "<td style='width:250px'>APP-LIC?</td>";
			for (let j = 1; j <= 2; j++) {
				resultTable += "<td style='width:250px'>DB-?-" + j + "</td>";
			}
			resultTable += "</tr>";
			scheme.zones.forEach(zone => {
				zone.nodes.forEach(node => {
					let databases = "";
					node.databases.forEach(database => {
						if (databases)
							databases += ", ";
						databases += database;
					});
					resultTable += "<tr>";
					resultTable += "<td>" + zone.name + "</td>";
					resultTable += "<td>" + node.name + "</td>";
					resultTable += "<td>" + databases + "</td>";
					resultTable += "<td>" + node.web_1 + "</td>";
					resultTable += "<td>" + node.web_2 + "</td>";
					resultTable += "<td>" + node.app_1 + "</td>";
					resultTable += "<td>" + node.app_2 + "</td>";
					resultTable += "<td>" + node.app_3 + "</td>";
					resultTable += "<td>" + node.app_lic + "</td>";
					resultTable += "<td>" + node.db_1 + "</td>";
					resultTable += "<td>" + node.db_2 + "</td>";
					resultTable += "</tr>";
				});
			});
			resultTable += "</table>";
			res.send(resultTable);
		})
		.catch(error => res.status(500).send(error));
});

module.exports = router;