"use strict";

var app = require("express")(),
    swaggy = require("../../lib/swaggy");

swaggy(app, { controllersDir: __dirname + "/rest-api" });

app.get("/", function (req, res) {
    res.send("Hello");
});

module.exports = app;
