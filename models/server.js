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
				Server.find({where: {id: server_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(onSuccess, onError) {
				var name = this.name;
				var alias = this.alias;
				Server.create({name: name, alias: alias})
					.then(onSuccess)
					.error(onError);
			},
			update: function(server_id, onSuccess, onError) {
				var id = server_id;
				var name = this.name;
				var alias = this.alias;
				Server.update({name: name, alias: alias}, {where: {id: id}})
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