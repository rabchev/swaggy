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
    confPublic      = {
        root: "/public",
        controllersDir: path.join(__dirname, "public")
    },
    confPrivate      = {
        root: "/private",
        controllersDir: path.join(__dirname, "private")
    };

// Let's simulate authentication middleware.
function authenticate(req, res, next) {
    var authz = req.headers.authorization;
    if (authz) {
        authz = new Buffer(authz.substr(6), "base64").toString();
        req.user = authz.split(":")[0];
        return next();
    }
    res.setHeader("WWW-Authenticate", "Basic");
    res.send(401, "To test please enter username bob without password.");
}

// We need body-parser for convenience.
app.use(bodyParser.json());
app.use(confPrivate.root, authenticate);

app.get("/", function(req, res){
    res.send("Hello World");
});

swaggy(app, confPublic, function (err) {
    if (err) {
        return console.log(err);
    }

    swaggy(app, confPrivate, function (err) {
        if (err) {
            return console.log(err);
        }

        app.listen(3003, function() {
            console.log("Listening on port 3003 ...");
            console.log("Go to http://localhost:3003/public/docs or http://localhost:3003/private/docs");
        });
    });
});
