"use strict";

var express     = require("express"),
    bodyParser  = require("body-parser"),
    swaggy      = require("../../lib/swaggy"),
    app         = express();

// We need body-parser for convenience, so we don't have to JSON parse every request individually.
app.use(bodyParser());

app.get("/", function(req, res){
    res.send("Hello World");
});

swaggy(app, function (err) {
    if (err) {
        return console.log(err);
    }

    app.listen(3000, function() {
        console.log("Listening on port 3000 ...");
        console.log("Go to http://localhost:3000/api/docs");
    });
});
