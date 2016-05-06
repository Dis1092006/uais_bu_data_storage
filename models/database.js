"use strict";

module.exports = function(sequelize, DataTypes) {
	var Database = sequelize.define("Database", {
		name: DataTypes.STRING,
		recovery_model: DataTypes.CHAR
	}, {
		timestamps: false,
		underscored: true,
		classMethods: {
			associate: function(models) {
				Database.belongsTo(models.Server, {as: 'dbms_server'});
			}
		},
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				Database.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(database_id, onSuccess, onError) {
				Database.find({where: {id: database_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getByName: function(database_name, onSuccess, onError) {
				Database.findAll({where: {name: database_name}, raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getByNameAndDBMSServer: function(database_name, dbms_server_id, onSuccess, onError) {
				Database.findAll({where: {name: database_name, dbms_server_id: dbms_server_id}, raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(dbms_server_id, onSuccess, onError) {
				Database.create({name: this.name, recovery_model: this.recovery_model, dbms_server_id: dbms_server_id})
					.then(onSuccess)
					.error(onError);
			},
			update: function(database_id, dbms_server_id, onSuccess, onError) {
				Database.update({
					name: this.name,
					recovery_model: this.recovery_model,
					dbms_server_id: dbms_server_id
				}, {
					where: {id: database_id}
				})
					.then(onSuccess)
					.error(onError);
				// Database.find({where: {id: db_id}}, {raw: true})
				// 	.then(database => {
				// 			if (database) {
				// 				let _name = this.name;
				// 				if (!_name)
				// 					_name = database.name;
				// 				let _server_id = server_id;
				// 				if (!_server_id)
				// 					_server_id = database.server_id;
				// 				return Database.update({name: _name, dbms_server_id: _server_id}, {where: {id: db_id}});
				// 			} else {
				// 				throw "Database not found";
				// 			}
				// 	})
				// 	.then(onSuccess)
				// 	.error(onError);
			},
			delete: function(database_id, onSuccess, onError) {
				Database.destroy({where: {id: database_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return Database;
};