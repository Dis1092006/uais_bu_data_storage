"use strict";

module.exports = function(sequelize, DataTypes) {
	var WebPublication = sequelize.define("WebPublication", {
		publication_name: DataTypes.STRING,
		is_cloud: DataTypes.BOOLEAN
	}, {
		timestamps: false,
		underscored: true,
		classMethods: {
			associate: function(models) {
				WebPublication.belongsTo(models.Server, {as: 'web_server'});
				WebPublication.belongsTo(models.Cluster1C, {as: 'cluster'});
				WebPublication.belongsTo(models.Infobase);
			}
		},
		instanceMethods: {
			getAll: function(onSuccess, onError) {
				WebPublication.findAll({raw: true})
					.then(onSuccess)
					.error(onError);
			},
			getById: function(publication_id, onSuccess, onError) {
				WebPublication.find({where: {id: publication_id}}, {raw: true})
					.then(onSuccess)
					.error(onError);
			},
			add: function(web_server_id, cluster_id, infobase_id, onSuccess, onError) {
				WebPublication.create({
					publication_name: this.publication_name,
					is_cloud: this.is_cloud,
					web_server_id: web_server_id,
					cluster1c_id: cluster_id,
					infobase_id: infobase_id
				})
					.then(onSuccess)
					.error(onError);
			},
			update: function(publication_id, onSuccess, onError) {
				WebPublication.update({
					publication_name: this.publication_name,
					is_cloud: this.is_cloud
				}, {where: {id: publication_id} })
					.then(onSuccess)
					.error(onError);
			},
			delete: function(publication_id, onSuccess, onError) {
				WebPublication.destroy({where: {id: publication_id}})
					.then(onSuccess)
					.error(onError);
			}
		}
	});

	return WebPublication;
};