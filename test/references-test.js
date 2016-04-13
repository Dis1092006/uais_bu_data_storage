"use strict";

var supertest = require("supertest");
var should = require("should");

var server = supertest.agent("http://localhost:9000");

describe("Проверка /api/v1/zones и /api/v1/nodes", function(){
	let addedNodeId = 0;
	let addedServerId = 0;
	let addedDatabaseId = 0;

	it("GET /api/v1/zones", function(done){
		server
			.get("/api/v1/zones")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/zones/:id", function(done){
		server
			.get("/api/v1/zones/1")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/zones/:id/nodes", function(done){
		server
			.get("/api/v1/zones/1/nodes")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/nodes", function(done){
		server
			.get("/api/v1/nodes")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/nodes/:id", function(done){
		server
			.get("/api/v1/nodes/1")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("POST /api/v1/zones/:id/nodes", function(done){
		server
			.post("/api/v1/zones/1/nodes")
			.send({"name":"Тест!"})
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				console.log(res.text);
				if (err) {
					throw err;
				}
				res.status.should.equal(200);
				res.body.should.have.property('id');
				addedNodeId = res.body.id;
				done();
			});
	});

	it("PUT /api/v1/nodes/:id", function(done){
		server
			.put("/api/v1/nodes/" + addedNodeId)
			.send({"name":"Тест! Удалить!"})
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/servers", function(done){
		server
			.get("/api/v1/servers")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("POST /api/v1/servers", function(done){
		server
			.post("/api/v1/servers")
			.send({"name":"Тест!","alias":"Тест!","zone":1,"node":addedNodeId})
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
					res.body.should.have.property('id');
				}
				addedServerId = res.body.id;
				done();
			});
	});

	it("GET /api/v1/servers/:id", function(done){
		server
			.get("/api/v1/servers/" + addedServerId)
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/servers?name=Тест", function(done){
		server
			.get("/api/v1/servers?alias=Тест")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/servers?alias=Тест", function(done){
		server
			.get("/api/v1/servers?alias=Тест")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/servers?zone=1", function(done){
		server
			.get("/api/v1/servers?zone=1")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

/*
	it("GET /api/v1/servers?zone=Рабочая", function(done){
		server
			.get("/api/v1/servers?zone=Рабочая")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
 throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/servers?zone=Рабочая&node=", function(done){
		server
			.get("/api/v1/servers?zone=Рабочая&node=" + addedNodeId)
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/servers?zone=Рабочая&node=Тест", function(done){
		server
			.get("/api/v1/servers?zone=Рабочая&node=Тест")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});
 */
	it("GET /api/v1/servers?zone=1&node=", function(done){
		server
			.get("/api/v1/servers?zone=1&node=" + addedNodeId)
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("PUT /api/v1/servers/:id", function(done){
		server
			.put("/api/v1/servers/" + addedServerId)
			.send({"name":"Тест! Удалить!","alias":"Тест!"})
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("GET /api/v1/databases", function(done){
		server
			.get("/api/v1/databases")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("POST /api/v1/databases", function(done){
		server
			.post("/api/v1/databases")
			.send({"name":"Тест!","server_id":"1"})
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
					res.body.should.have.property('id');
				}
				addedDatabaseId = res.body.id;
				done();
			});
	});

	it("GET /api/v1/databases/:id", function(done){
		server
			.get("/api/v1/databases/" + addedDatabaseId)
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("PUT /api/v1/databases/:id", function(done){
		server
			.put("/api/v1/databases/" + addedDatabaseId)
			.send({"name":"Тест! Удалить!"})
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("PUT /api/v1/databases/:id", function(done){
		server
			.put("/api/v1/databases/" + addedDatabaseId)
			.send({"server_id":"2"})
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("DELETE /api/v1/databases/:id", function(done){
		server
			.delete("/api/v1/databases/" + addedDatabaseId)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("DELETE /api/v1/servers/:id", function(done){
		server
			.delete("/api/v1/servers/" + addedServerId)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});

	it("DELETE /api/v1/nodes/:id", function(done){
		server
			.delete("/api/v1/nodes/" + addedNodeId)
			.expect(200)
			.end(function(err, res){
				if (err) {
					console.log(err);
					throw err;
				} else {
					console.log(res.text);
					res.status.should.equal(200);
				}
				done();
			});
	});
});

