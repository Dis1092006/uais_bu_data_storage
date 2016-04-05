"use strict";
var models = require('../models');

module.exports = function(sequelize, DataTypes) {
	var Server = sequelize.define("Server", {
		name: DataTypes.STRING,
		alias: DataTypes.STRING
	}, {
		timestamps: false,
		underscored: true,
		classMethods: {
			associate: function(models) {
				Server.belongsTo(models.Zone);
				Server.belongsTo(models.Node);
			}
		},
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				Server.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(server_id, onSuccess, onError) {
				Server.find({where: {id: server_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getByName: function(server_name, onSuccess, onError) {
				Server.findAll({where: {name: server_name}, raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(models, a_zone, a_node, onSuccess, onError) {
				let zoneModel = models.Zone.build();
				let nodeModel = models.Node.build();
				let zone_id = null;
				let node_id = null;
				zoneModel.getByNameOrByID(a_zone)
					.then(the_zone => {
						if (the_zone)
							zone_id = the_zone.id;
						return nodeModel.getByNameOrByID(a_node, zone_id);
					})
					.then(the_node => {
						if (the_node)
							node_id = the_node.id;
						return Server.create({name: this.name, alias: this.alias, zone_id: zone_id, node_id: node_id});
					})
					.then(onSuccess)
					.catch(onError);
			},
			update: function(server_id, onSuccess, onError) {
				Server.update({name: this.name, alias: this.alias}, {where: {id: server_id}})
					.then(onSuccess)
					.error(onError);
			},
			delete: function(server_id, onSuccess, onError) {
				Server.destroy({where: {id: server_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return Server;
};