"use strict";

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
			getByFilter: function(filter, onSuccess, onError) {
				sequelize.query(
					"SELECT * FROM Servers WHERE " + filter,
					{type: sequelize.QueryTypes.SELECT}
				)
					.then(onSuccess)
					.catch(onError);
			},
			add: function(zone_id, node_id, onSuccess, onError) {
				Server.create({name: this.name, alias: this.alias, zone_id: zone_id, node_id: node_id})
					.then(onSuccess)
					.error(onError);
			},
			update: function(server_id, zone_id, node_id, onSuccess, onError) {
				Server.update({name: this.name, alias: this.alias, zone_id: zone_id, node_id: node_id}, {where: {id: server_id}})
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