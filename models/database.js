"use strict";

module.exports = function(sequelize, DataTypes) {
	var Database = sequelize.define("Database", {
		name: DataTypes.STRING
	}, {
		timestamps: false,
		underscored: true,
		classMethods: {
			associate: function(models) {
				Database.belongsTo(models.Server);
			}
		},
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				Database.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(db_id, onSuccess, onError) {
				Database.find({where: {id: db_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getLastBackups: function(onSuccess, onError) {
				let _query =
					`
					SELECT @@Servername AS ServerName ,
						d.Name AS DBName ,
						b.Backup_finish_date ,
						bmf.Physical_Device_name
					FROM sys.databases d
					INNER JOIN msdb..backupset b ON b.database_name = d.name
					AND b.[type] = 'D'
					INNER JOIN msdb.dbo.backupmediafamily bmf ON b.media_set_id = bmf.media_set_id
					ORDER BY d.NAME ,
						b.Backup_finish_date DESC;
					GO
					`;
				// Получить список баз данных.

				// Цикл по списку баз и подключение к разным серверам.

					// Получение данных о последнем архиве.
				sequelize.query(_query, {type: sequelize.QueryTypes.SELECT})
					.then(
						backups => {
							if (backups.length > 0) {
								resolve(backups[0]);
							} else {
								reject(null);
							}
						}
					)
					.catch(error => reject(error));
			},
			add: function(server_id, onSuccess, onError) {
				Database.create({name: this.name, server_id: server_id})
					.then(onSuccess)
					.error(onError);
			},
			update: function(db_id, server_id, onSuccess, onError) {
				Database.find({where: {id: db_id}}, {raw: true})
					.then(database => {
							if (database) {
								let _name = this.name;
								if (!_name)
									_name = database.name;
								let _server_id = server_id;
								if (!_server_id)
									_server_id = database.server_id;
								return Database.update({name: _name, server_id: _server_id}, {where: {id: db_id}});
							} else {
								throw "Database not found";
							}
					})
					.then(onSuccess)
					.error(onError);
			},
			delete: function(db_id, onSuccess, onError) {
				Database.destroy({where: {id: db_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return Database;
};