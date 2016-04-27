"use strict";

module.exports = function(sequelize, DataTypes) {
	var LastBackup = sequelize.define("LastBackup", {
		file_name: DataTypes.STRING,
		backup_date: DataTypes.DATE,
		backup_type: DataTypes.STRING,
		backup_size: DataTypes.INTEGER,
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
				let _query = `
					SELECT 
						[Databases].[name] AS database_name
						,[LastBackups].[file_name]
						,[LastBackups].[backup_date]
						,[LastBackups].[backup_type]
						,[LastBackups].[backup_size]
					FROM [LastBackups]
					LEFT JOIN [Databases] 
						ON [LastBackups].[database_id] = [Databases].[id]
					ORDER BY
						[Databases].name
					`;
				sequelize.query(
					_query,
					{type: sequelize.QueryTypes.SELECT}
				)
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
				LastBackup.create({
					file_name: this.file_name,
					database_id: db_id,
					backup_date: this.backup_date,
					backup_type: this.backup_type,
					backup_size: this.backup_size
				})
					.then(onSuccess)
					.error(onError);
			},
			update: function(db_id, onSuccess, onError) {
				LastBackup.update({
					file_name: this.file_name,
					backup_date: this.backup_date,
					backup_type: this.backup_type,
					backup_size: this.backup_size
				}, {where: {database_id: db_id}})
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