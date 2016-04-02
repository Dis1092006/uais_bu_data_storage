"use strict";

module.exports = function(sequelize, DataTypes) {
	var Node = sequelize.define('Node', {
		name: DataTypes.STRING,
	}, {
		timestamps: false,
		classMethods: {
			associate: function(models) {
				Node.belongsTo(models.Zone);
				Node.hasMany(models.Server);
			}
		},
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				Node.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getAllByZone: function(zone_id, onSuccess, onError) {
				Node.findAll({raw: true, where: {zoneid: zone_id}})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(node_id, onSuccess, onError) {
				Node.find({where: {id: node_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getByName: function(node_name, onSuccess, onError) {
				Node.findAll({where: {Name: node_name}, raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(zone_id, onSuccess, onError) {
				Node.create({Name: this.name, ZoneId: zone_id})
					.then(onSuccess)
					.error(onError);
			},
			update: function(node_id, onSuccess, onError) {
				Node.update({Name: this.name}, {where: {ID: node_id} })
					.then(onSuccess)
					.error(onError);
			},
			delete: function(node_id, onSuccess, onError) {
				Node.destroy({where: {ID: node_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});
	return Node;
};