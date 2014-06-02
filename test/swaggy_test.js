"use strict";

var request         = require("supertest"),
    chai            = require("chai"),
    app             = require("./app"),
    expect          = chai.expect,
    agent           = request.agent(app);

function test(done, setReq, examine) {
    var req = setReq(agent);
    req.end(function (err, res) {
        if (err) {
            return done(err);
        }
        if (examine) {
            var data;
            if (res.type === "text/html" && res.text) {
                data = res.text;
            } else {
                data = res.body;
            }
            examine(data);
            done();
        } else {
            done();
        }
    });
}

describe("public site", function () {

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

    it("get docs", function (done) {
        test(done, function (req) {
            return req
                .get("/api/docs")
                .set("Accept", "text/html")
                .expect("Content-Type", /html/)
                .expect(200);
        }, function (data) {
            console.log("foo: " + data);
            //expect(data).to.equal("Hello");
        });
    });

});
