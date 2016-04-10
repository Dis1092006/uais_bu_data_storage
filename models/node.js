"use strict";

module.exports = function(sequelize, DataTypes) {
	var Node = sequelize.define('Node', {
		name: DataTypes.STRING,
	}, {
		timestamps: false,
		underscored: true,
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
				Node.findAll({raw: true, where: {zone_id: zone_id}})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(node_id) {
				return new Promise(function(resolve, reject) {
					let _id = parseInt(node_id, 10);
					if (isNaN(_id)) {
						reject(null)
					}
					else {
						Node.find({where: {id: _id}}, {raw: true})
							.then(node => resolve(node))
							.catch(error => reject(error));
					}
				});
			},
			getByName: function(node_name, zone_id, strictSearch) {
				return new Promise(function(resolve, reject) {
					let _query = "";
					if (strictSearch) {
						_query = "SELECT TOP 1 [id], [name], [zone_id] FROM [Nodes] AS [Node] WHERE [Node].[name] = N'" + node_name + "' AND [Node].[zone_id] = " + zone_id + " ORDER BY [id]";
					} else {
						_query = "SELECT TOP 1 [id], [name], [zone_id] FROM [Nodes] AS [Node] WHERE [Node].[name] LIKE N'%" + node_name + "%' AND [Node].[zone_id] = " + zone_id + " ORDER BY [id]";
					}
					sequelize.query(_query, {type: sequelize.QueryTypes.SELECT})
						.then(
							nodes => {
								if (nodes.length > 0) {
									resolve(nodes[0]);
								} else {
									reject(null);
								}
							}
						)
						.catch(error => reject(error));
				});
			},
			add: function(zone_id, onSuccess, onError) {
				Node.create({name: this.name, zone_id: zone_id})
					.then(onSuccess)
					.error(onError);
			},
			update: function(node_id, onSuccess, onError) {
				Node.update({name: this.name}, {where: {id: node_id} })
					.then(onSuccess)
					.error(onError);
			},
			delete: function(node_id, onSuccess, onError) {
				Node.destroy({where: {id: node_id}})
					.then(onSuccess)
					.error(onError);
			},
			getByNameOrByID: function(node_something, zone_id, strictSearch, needCreate) {
				return new Promise(function(resolve, reject) {
					let nodeModel = Node.build();
					if (node_something) {
						// Поиск по ID.
						nodeModel.getById(node_something)
							.then(node => resolve(node))
							.catch(() => {
								console.log("Поиск ноды по имени");
								// Поиск по имени.
								nodeModel.getByName(node_something, zone_id)
									.then(node => resolve(node))
									.catch(() => {
										if (zone_id) {
											if (needCreate) {
												console.log("Создание ноды, если не найдена");
												// Создание зоны, если не найдена.
												Node.create({name: node_something, zone_id: zone_id})
													.then(node => resolve(node))
													.catch(error => reject(error))
											}
										} else {
											console.log("Зона не задана, ноду создать невозможно!");
											resolve(null);
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
	return Node;
};