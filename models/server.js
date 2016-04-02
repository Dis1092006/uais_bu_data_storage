"use strict";

module.exports = function(sequelize, DataTypes) {
	var Server = sequelize.define("Server", {
		name: DataTypes.STRING,
		alias: DataTypes.STRING
	}, {
		timestamps: false,
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
			add: function(zone, node, onSuccess, onError) {
				// Обработка переданного значениия зоны.
				if (zone) {
					models.Zone.getByName(zone)
						.then()
						.error();
				}
				Server.create({name: this.name, alias: this.alias})
					.then(onSuccess)
					.error(onError);
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