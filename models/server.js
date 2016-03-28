"use strict";

module.exports = function(sequelize, DataTypes) {
	var Server = sequelize.define("Server", {
		name: DataTypes.STRING,
		alias: DataTypes.STRING
	}, {
		timestamps: false,
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				Server.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(server_id, onSuccess, onError) {
				Server.find({where: {ID: server_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getByName: function(server_name, onSuccess, onError) {
				Server.findAll({where: {Name: server_name}, raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(onSuccess, onError) {
				Server.create({Name: this.name, Alias: this.alias})
					.then(onSuccess)
					.error(onError);
			},
			update: function(server_id, onSuccess, onError) {
				Server.update({Name: this.name, Alias: this.alias}, {where: {ID: server_id}})
					.then(onSuccess)
					.error(onError);
			},
			delete: function(server_id, onSuccess, onError) {
				Server.destroy({where: {ID: server_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return Server;
};