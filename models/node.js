"use strict";

module.exports = function(sequelize, DataTypes) {
	var Node = sequelize.define('Node', {
		name: DataTypes.STRING,
	}, {
		timestamps: false,
		classMethods: {
			associate: function(models) {
				Node.belongsTo(models.Zone, {
					onDelete: "CASCADE"//,
					// foreignKey: {
					// 	allowNull: false
					// }
				});
			}
		},
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				Node.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getAllByZone: function(zone_id, onSuccess, onError) {
				var zoneId = zone_id;
				Node.findAll({raw: true, where: {zoneId: zoneId}})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(node_id, onSuccess, onError) {
				Node.find({where: {id: node_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(zone_id, onSuccess, onError) {
				var name = this.name;
				var zoneId = zone_id;
				Node.create({name: name, ZoneId: zoneId})
					.then(onSuccess)
					.error(onError);
			},
			update: function(node_id, onSuccess, onError) {
				var id = node_id;
				var name = this.name;
				Node.update({name: name},{where: {id: id} })
					.then(onSuccess)
					.error(onError);
			},
			delete: function(node_id, onSuccess, onError) {
				Node.destroy({where: {id: node_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});
	return Node;
};