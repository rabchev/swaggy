"use strict";

var request         = require("supertest"),
    chai            = require("chai"),
    server          = require("../server"),
    expect          = chai.expect,
    app;

function test(done, setReq, examine) {
    var req = setReq(request(app));
    req.end(function (err, res) {
        if (err) {
            return done(err);
        }
        if (examine) {
            try {
                examine(res.body);
            } catch (err) {
                return done(err);
            }
        }
        done();
    });
}

describe("public site", function () {

    before(function (done) {
        server.init(function (err, res) {
            if (err) {
                return done(err);
            }

            app = res;
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
            expect(data).to.be.ok;
        });
    });
});
