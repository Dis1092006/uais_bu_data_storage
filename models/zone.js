"use strict";

module.exports = function(sequelize, DataTypes) {
	var Zone = sequelize.define("Zone", {
		name: DataTypes.STRING
	}, {
		timestamps: false,
		classMethods: {
			associate: function(models) {
				Zone.hasMany(models.Node)
			}
		},
		instanceMethods: {
			getAll: function (onSuccess, onError) {
				Zone.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getByName: function(zone_name, onSuccess, onError) {
				Zone.findAll({where: {name: zone_name}, raw: true})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return Zone;
};