"use strict";

var request         = require("supertest"),
    chai            = require("chai"),
    server          = require("./app"),
    expect          = chai.expect,
    agent;

function test(done, setReq, examine) {
    var req = setReq(agent);
    req.end(function (err, res) {
        if (err) {
            return done(err);
        }
        if (examine) {
            var data;
            if (res.body && Object.keys(res.body).length) {
                data = res.body;
            } else {
                data = res.text;
            }
            examine(data);
            done();
        } else {
            done();
        }
    });
}

describe("swaggy", function () {

    before(function (done) {
        server.init(function (err, app) {
            if (err) {
                return done(err);
            }

            agent = request.agent(app);
            done();
        });
    });

    it("get index", function (done) {
        test(done, function (req) {
            return req
                .get("/")
                .set("Accept", "text/html")
                .expect("Content-Type", /html/)
                .expect(200);
        }, function (data) {
            expect(data).to.equal("Hello");
        });
    });

    it("get docs /", function (done) {
        test(done, function (req) {
            return req
                .get("/api/docs/")
                .set("Accept", "text/html")
                .expect("Content-Type", /html/)
                .expect(200);
        }, function (data) {
            expect(data).to.contain("url: \"http://localhost:3000/api/api-docs\",");
        });
    });

    it("get docs /index.html", function (done) {
        test(done, function (req) {
            return req
            .get("/api/docs/index.html")
            .set("Accept", "text/html")
            .expect("Content-Type", /html/)
            .expect(200);
        }, function (data) {
            expect(data).to.contain("url: \"http://localhost:3000/api/api-docs\",");
        });
    });

    it("get docs /css/reset.css", function (done) {
        test(done, function (req) {
            return req
            .get("/api/docs/css/reset.css")
            .expect("Content-Type", "text/css; charset=UTF-8")
            .expect(200);
        }, function (data) {
            expect(data).to.contain("/* http://meyerweb.com/eric/tools/css/reset/ v2.0 | 20110126 */");
        });
    });

    it("get docs /swagger-ui.js", function (done) {
        test(done, function (req) {
            return req
            .get("/api/docs/swagger-ui.js")
            .expect("Content-Type", "application/javascript")
            .expect(200);
        }, function (data) {
            expect(data).to.contain("$(function() {");
        });
    });

    it("get /api/api-docs", function (done) {
        test(done, function (req) {
            return req
            .get("/api/api-docs")
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data.apiVersion).to.equal("0.1");
        });
    });

    it("post article", function (done) {
        test(done, function (req) {
            return req
            .post("/api/articles")
            .set("Accept", "application/json")
            .send({ author: "Boyan Rabchev",
                   title: "dolore te quae quid sunt ita eram deserunt enim tractavissent",
                   content: "O culpa non quis. Et elit quibusdam litteris." })
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data._id).to.equal(0);
        });
    });

    it("post article 2", function (done) {
        test(done, function (req) {
            return req
            .post("/api/articles")
            .set("Accept", "application/json")
            .send({ author: "John Smit",
                   title: "an malis id praetermissum te",
                   content: "relinqueret velit si aliquip quamquam noster id firmissimum ullamco laborum" })
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data._id).to.equal(1);
        });
    });

    it("get article by id", function (done) {
        test(done, function (req) {
            return req
            .get("/api/articles/0")
            .set("Accept", "application/json")
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data._id).to.equal(0);
            expect(data.author).to.equal("Boyan Rabchev");
        });
    });

    it("get articles", function (done) {
        test(done, function (req) {
            return req
            .get("/api/articles")
            .set("Accept", "application/json")
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data).to.have.length.of(2);
            expect(data[1].author).to.equal("John Smit");
        });
    });

    it("update article", function (done) {
        test(done, function (req) {
            return req
            .put("/api/articles/0")
            .set("Accept", "application/json")
            .send({ author: "Suzuki Nakamura" })
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data._id).to.equal(0);
            expect(data.author).to.equal("Suzuki Nakamura");
        });
    });

    it("get article by id", function (done) {
        test(done, function (req) {
            return req
            .get("/api/articles/0")
            .set("Accept", "application/json")
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data._id).to.equal(0);
            expect(data.author).to.equal("Suzuki Nakamura");
        });
    });

    it("delete article by id", function (done) {
        test(done, function (req) {
            return req
            .del("/api/articles/0")
            .set("Accept", "application/json")
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data.count).to.equal(1);
        });
    });

    it("get articles", function (done) {
        test(done, function (req) {
            return req
            .get("/api/articles")
            .set("Accept", "application/json")
            .expect("Content-Type", "application/json; charset=utf-8")
            .expect(200);
        }, function (data) {
            expect(data).to.have.length.of(1);
            expect(data[0].author).to.equal("John Smit");
        });
    });

});
