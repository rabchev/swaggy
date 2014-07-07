"use strict";

// In this example we explicitly set controllersDir and therefore we
// don't need to care about current working directory.
//
// if (process.cwd() !== __dirname) {
//     process.chdir(__dirname);
// }

var path        = require("path"),
    express     = require("express"),
    bodyParser  = require("body-parser"),
    swaggy      = require("../../lib/swaggy"),
    app         = express(),
    confV1      = {
        apiVersion: "1.0",
        root: "/v1",
        controllersDir: path.join(__dirname, "api-v1")
    },
    confV2      = {
        apiVersion: "2.0",
        root: "/v2",
        controllersDir: path.join(__dirname, "api-v2")
    };

// We need body-parser for convenience.
app.use(bodyParser.json());

app.get("/", function(req, res){
    res.send("Hello World");
});

swaggy(app, confV1, function (err) {
    if (err) {
        return console.log(err);
    }

    swaggy(app, confV2, function (err) {
        if (err) {
            return console.log(err);
        }

        app.listen(3002, function() {
            console.log("Listening on port 3002 ...");
            console.log("Go to http://localhost:3002/v1/docs or http://localhost:3002/v2/docs");
        });
    });
});
