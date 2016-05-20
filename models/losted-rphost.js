"use strict";

module.exports = function(sequelize, DataTypes) {
	var LostedRPHost = sequelize.define("LostedRPHost", {
		cluster: DataTypes.STRING,
		server: DataTypes.STRING,
		rphosts: DataTypes.STRING
	}, {
		underscored: true,
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				LostedRPHost.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(onSuccess, onError) {
				LostedRPHost.create({
					cluster: this.cluster,
					server: this.server,
					rphosts: this.rphosts
				})
					.then(onSuccess)
					.error(onError);
			},
			delete: function(server, onSuccess, onError) {
				LostedRPHost.destroy({where: {server: server}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return LostedRPHost;
};