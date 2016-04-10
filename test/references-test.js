"use strict";

var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.
var server = supertest.agent("http://localhost:9000");

describe("Проверка /api/v1", function(){
	let addedNodeId = 0;

	it("GET /api/v1/zones", function(done){
		server
			.get("/api/v1/zones")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				console.log(res.text);
				res.status.should.equal(200);
				done();
			});
	});

	it("GET /api/v1/zones/:id", function(done){
		server
			.get("/api/v1/zones/1")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				console.log(res.text);
				res.status.should.equal(200);
				done();
			});
	});

	it("GET /api/v1/zones/:id/nodes", function(done){
		server
			.get("/api/v1/zones/1/nodes")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				console.log(res.text);
				res.status.should.equal(200);
				done();
			});
	});

	it("GET /api/v1/nodes", function(done){
		server
			.get("/api/v1/nodes")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				console.log(res.text);
				res.status.should.equal(200);
				done();
			});
	});

	it("GET /api/v1/nodes/:id", function(done){
		server
			.get("/api/v1/nodes/1")
			.expect("Content-type", /json/)
			.expect(200)
			.end(function(err, res){
				console.log(res.text);
				res.status.should.equal(200);
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
				console.log(res.text);
				res.status.should.equal(200);
				done();
			});
	});

	it("DELETE /api/v1/nodes/:id", function(done){
		server
			.delete("/api/v1/nodes/" + addedNodeId)
			.expect(200)
			.end(function(err, res){
				console.log(res.text);
				res.status.should.equal(200);
				done();
			});
	});
});


