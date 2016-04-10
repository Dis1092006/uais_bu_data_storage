"use strict";

module.exports = function(sequelize, DataTypes) {
	var Zone = sequelize.define("Zone", {
		name: DataTypes.STRING
	}, {
		timestamps: false,
		underscored: true,
		classMethods: {
			associate: function(models) {
				Zone.hasMany(models.Node);
				Zone.hasMany(models.Server);
			}
		},
		instanceMethods: {
			getAll: function (onSuccess, onError) {
				Zone.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(zone_id) {
				return new Promise(function(resolve, reject) {
					let _id = parseInt(zone_id, 10);
					if (isNaN(_id)) {
						reject(null)
					}
					else {
						Zone.find({where: {id: _id}}, {raw: true})
							.then(zone => resolve(zone))
							.catch(error => reject(error));
					}
				});
			},
			getByName: function(zone_name, strictSearch) {
				return new Promise(function(resolve, reject) {
					let _query = "";
					if (strictSearch) {
						_query = "SELECT TOP 1 [id], [name] FROM [Zones] AS [Zone] WHERE [Zone].[name] = N'" + zone_name + "' ORDER BY [id]";
					} else {
						_query = "SELECT TOP 1 [id], [name] FROM [Zones] AS [Zone] WHERE [Zone].[name] LIKE N'%" + zone_name + "%' ORDER BY [id]";
					}
					sequelize.query(_query, {type: sequelize.QueryTypes.SELECT})
						.then(
							zones => {
								if (zones.length > 0) {
									resolve(zones[0]);
								} else {
									reject(null);
								}
							}
						)
						.catch(error => reject(error));
				});
			},
			getByNameOrByID: function(zone_something, strictSearch, needCreate) {
				return new Promise(function(resolve, reject) {
					let zoneModel = Zone.build();
					if (zone_something) {
						// Поиск по ID.
						zoneModel.getById(zone_something)
							.then(zone => resolve(zone))
							.catch(() => {
								console.log("Поиск зоны по имени");
								// Поиск по имени.
								zoneModel.getByName(zone_something, strictSearch)
									.then(zone => resolve(zone))
									.catch(() => {
										if (needCreate) {
											console.log("Создание зоны, если не найдена");
											// Создание зоны, если не найдена.
											Zone.create({name: zone_something})
												.then(zone => resolve(zone))
												.catch(error => reject(error))
										}
									})
							})
					}
					else
						resolve(null);
				});
			}
		}
	});

	return Zone;
};