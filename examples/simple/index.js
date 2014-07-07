"use strict";

// Swaggy assumes the current working directory is the project root.
// By default it will look for ./rest-api/ directory to scan .js files for endpoints.
if (process.cwd() !== __dirname) {
    process.chdir(__dirname);
}

var express     = require("express"),
    bodyParser  = require("body-parser"),
    swaggy      = require("../../lib/swaggy"),
    app         = express();

// We need body-parser for convenience.
app.use(bodyParser.json());

app.get("/", function(req, res){
    res.send("Hello World");
});

swaggy(app, function (err) {
    if (err) {
        return console.log(err);
    }

    app.listen(3001, function() {
        console.log("Listening on port 3001 ...");
        console.log("Go to http://localhost:3001/api/docs");
    });
});
