"use strict";

module.exports = function(sequelize, DataTypes) {
	var DBMSServer = sequelize.define("DBMSServer", {
		instance_name: DataTypes.STRING,
		port: DataTypes.INTEGER,
		user: DataTypes.STRING,
		password: DataTypes.STRING
	}, {
		timestamps: false,
		underscored: true,
		classMethods: {
			associate: function(models) {
				DBMSServer.belongsTo(models.Server);
			}
		},
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				DBMSServer.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(dbms_server_id, onSuccess, onError) {
				DBMSServer.find({where: {id: dbms_server_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getByName: function(dbms_server_name, onSuccess, onError) {
				DBMSServer.findAll({where: {instance_name: dbms_server_name}, raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(server_id, onSuccess, onError) {
				DBMSServer.create({
					instance_name: this.instance_name,
					port: this.port,
					user: this.user,
					password: this.password,
					server_id: server_id
				})
					.then(onSuccess)
					.error(onError);
			},
			update: function(dbms_server_id, onSuccess, onError) {
				DBMSServer.update({
					instance_name: this.instance_name,
					port: this.port,
					user: this.user,
					password: this.password
				}, {where: {id: dbms_server_id} })
					.then(onSuccess)
					.error(onError);
			},
			delete: function(dbms_server_id, onSuccess, onError) {
				DBMSServer.destroy({where: {id: dbms_server_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return DBMSServer;
};