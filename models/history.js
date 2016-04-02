"use strict";

module.exports = function(sequelize, DataTypes) {
	var History = sequelize.define("History", {
		date: {type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW}
	}, {
		freezeTableName: true,
		tableName: "History",
		timestamps: false,
		classMethods: {
			associate: function(models) {
				History.belongsTo(models.Zone),
				History.belongsTo(models.Node),
				History.belongsTo(models.Server)
			}
		},
		instanceMethods: {
			getAllByDate: function (date, onSuccess, onError) {
				History.findAll({where: {date: date}, raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(zone_id, node_id, server_id, onSuccess, onError) {
				sequelize.query(
					"INSERT INTO [History] ([Date], [ZoneID], [NodeID], [ServerID]) OUTPUT INSERTED.* VALUES ('" + this.date + "', " + zone_id + ", " + node_id + ", " + server_id + ")",
					{type: sequelize.QueryTypes.INSERT}
				)
				// History.create({Date: this.date, ZoneID: zone_id, NodeID: node_id, ServerID: server_id})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return History;
};