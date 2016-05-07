"use strict";

module.exports = function(sequelize, DataTypes) {
	var DBFileSizesHistory = sequelize.define("DBFileSizesHistory", {
		date: {type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW},
		file_name: DataTypes.STRING,
		file_type: DataTypes.CHAR,
		file_size: DataTypes.INTEGER
	}, {
		freezeTableName: true,
		tableName: "DBFileSizesHistory",
		timestamps: false,
		underscored: true,
		classMethods: {
			associate: function(models) {
				DBFileSizesHistory.belongsTo(models.Database)
			}
		},
		instanceMethods: {
			getAllByDate: function (date, onSuccess, onError) {
				DBFileSizesHistory.findAll({where: {date: date}, raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getId: function(database_id, onSuccess, onError) {
				sequelize.query(
					"SELECT id FROM [DBFileSizesHistory] "
					+ "WHERE [date] = '" + this.date + "'"
					+ "	AND [database_id] = N'" + database_id + "'"
					+ "	AND [file_name] = N'" + this.file_name + "'"
					+ "	AND [file_type] = N'" + this.file_type + "'",
					{type: sequelize.QueryTypes.SELECT}
				)
					.then(onSuccess)
					.error(onError);
			},
			add: function(database_id, onSuccess, onError) {
				sequelize.query(
					"INSERT INTO [DBFileSizesHistory] ([date], [file_name], [file_type], [file_size], [database_id]) OUTPUT INSERTED.* VALUES ('" + this.date + "', '" + this.file_name + "', '" + this.file_type + "', " + this.file_size + ", " + database_id + ");",
					{type: sequelize.QueryTypes.INSERT}
				)
					.then(onSuccess)
					.error(onError);
			},
			updateSize: function(id, onSuccess, onError) {
				sequelize.query(
					"UPDATE [DBFileSizesHistory] SET [file_size] = " + this.file_size + " OUTPUT INSERTED.* WHERE id = " + id + ";",
					{type: sequelize.QueryTypes.UPDATE}
				)
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return DBFileSizesHistory;
};