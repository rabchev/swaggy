"use strict";

var app         = require("express")(),
    bodyParser  = require("body-parser"),
    swaggy      = require("../../lib/swaggy");

exports.init = function (done) {
    app.use(bodyParser());

    app.get("/", function (req, res) {
        res.send("Hello");
    });

    swaggy(app, { controllersDir: __dirname + "/rest-api" }, function (err) {
        done(err, app);
    });
};
