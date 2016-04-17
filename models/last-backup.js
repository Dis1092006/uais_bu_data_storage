"use strict";

module.exports = function(sequelize, DataTypes) {
	var LastBackup = sequelize.define("LastBackup", {
		file_name: DataTypes.STRING
	}, {
		timestamps: false,
		underscored: true,
		classMethods: {
			associate: function(models) {
				LastBackup.belongsTo(models.Database);
			}
		},
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				LastBackup.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getByDatabaseId: function(db_id, onSuccess, onError) {
				sequelize.query(
					"SELECT * FROM [LastBackups] WHERE [database_id] = N'" + db_id + "'",
					{type: sequelize.QueryTypes.SELECT}
				)
					.then(onSuccess)
					.error(onError);
			},
			add: function(db_id, onSuccess, onError) {
				LastBackup.create({file_name: this.file_name, database_id: db_id})
					.then(onSuccess)
					.error(onError);
			},
			update: function(db_id, onSuccess, onError) {
				LastBackup.update({file_name: this.file_name}, {where: {database_id: db_id}})
					.then(onSuccess)
					.error(onError);
			},
			delete: function(db_id, onSuccess, onError) {
				LastBackup.update({file_name: ""}, {where: {database_id: db_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return LastBackup;
};