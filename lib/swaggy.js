"use strict";

var swagger     = require("swagger-node-express"),
    express     = require("express"),
    async       = require("async"),
    path        = require("path"),
    util        = require("util"),
    fs          = require("fs"),
    _           = require("lodash"),
    Strings     = require("./strings");

function addMethods(controller, name, done) {
    var err;
    _.forOwn(controller, function (val, key) {
        if (val.spec) {
            switch (val.spec.method) {
            case "GET":
                swagger.addGet(val);
                break;
            case "POST":
                swagger.addPost(val);
                break;
            case "PUT":
                swagger.addPut(val);
                break;
            case "PATCH":
                swagger.addPatch(val);
                break;
            case "DELETE":
                swagger.addDelete(val);
                break;
            default:
                var msg;
                if (val.spec.method) {
                    msg = util.format(Strings.INVALID_HTTP_METHOD, key, name);
                } else {
                    msg = util.format(Strings.NO_HTTP_METHOD, key, name);
                }
                err = new Error(msg);
                return false;
            }
        }
    });
    done(err);
}

module.exports = function (app, opts, callback) {
    if (!app) {
        return callback(new Error());
    }
    var api         = express();
    app.use("/api", api);

    swagger.setAppHandler(api);
    swagger.configureSwaggerPaths("", "/api-docs", "");

    swagger.setHeaders = function setHeaders(res) {
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        res.header("Content-Type", "application/json; charset=utf-8");
    };
    global.swagger = swagger;
    fs.readdir(path.join(__dirname, "rest-api"), function (err, files) {
        async.each(files, function (file, done) {
            var controller;
            if (path.extname(file) !== ".js") {
                return done();
            }
            try {
                controller = require("./rest-api/" + file);
                if (controller.init) {
                    controller.init(function (err) {
                        if (err) {
                            return done(err);
                        }
                        addMethods(controller, file, done);
                    });
                } else {
                    addMethods(controller, file, done);
                }
            } catch (err) {
                return done(err);
            }
        }, function (err) {
            var uiPath = path.join(__dirname, "..", "client", "bower_components", "swagger-ui", "dist");
            swagger.configure(app.get("swaggerUrl") + "/api", "0.1");
            api.use("/docs", express.static(uiPath));
            callback(err);
        });
    });
};
