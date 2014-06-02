"use strict";

var Swagger     = require("swagger-node-express"),
    swaggerUI   = require("swagger-ui"),
    express     = require("express"),
    path        = require("path"),
    walk        = require("walk"),
    util        = require("util"),
    url         = require("url"),
    _           = require("lodash"),
    Strings     = require("./strings"),
    defaults    = {
        hostURL: "http://localhost:3000",
        root: "/api",
        docsPath: "/docs",
        resourcePath: "/api-docs",
        format: "",
        suffix: "",
        headers: {
            "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT",
            "Content-Type": "application/json; charset=utf-8"
        },
        controllersDir: path.resolve("rest-api"),
        apiVersion: "0.1"
    };

function renderUI(req, res) {
    res.write("foo");
}

function addMethods(swagger, controller, name, done) {
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
//  Currently we cannot use multiple instances of Swagger but hopefully soon it will be possible.
    var swagger = Swagger,
        walker  = walk.walk(opts.controllersDir),
        api;

    if (typeof opts === "function") {
        callback = opts;
        opts = null;
    }

    if (!app) {
        throw new Error(util.format(Strings.REQUIRED_ARG, "app"));
    }

    if (!callback) {
        throw new Error(util.format(Strings.REQUIRED_ARG, "callback"));
    }

    opts = _.defaults(opts || {}, defaults);

    if (opts.root === "/") {
        api = app;
    } else {
        api = express();
        app.use(opts.root, api);
    }

    swagger.setAppHandler(api);
    swagger.configureSwaggerPaths(opts.format, opts.resourcePath, opts.suffix);

    swagger.setHeaders = function setHeaders(res) {
        _.forOwn(function (val, key) {
            res.header(key, val);
        });
    };

    walker.on("file", function (root, fileStats, next) {
        var controller;
        if (path.extname(fileStats.name) !== ".js") {
            return next();
        }
        try {
            controller = require(path.join(opts.controllersDir, fileStats.name));
            if (controller.init) {
                controller.init(function (err) {
                    if (err) {
                        return next(err);
                    }
                    addMethods(controller, fileStats.name, next);
                });
            } else {
                addMethods(controller, fileStats.name, next);
            }
        } catch (err) {
            next(err);
        }
    });

    walker.on("end", function () {
        var docs = opts.docsPath;
        if (docs[docs.length - 1] !== "/") {
            docs += "/";
        }
        swagger.configure(url.resolve(opts.hostURL, opts.root), opts.apiVersion);
        api.use(docs + "index.html", renderUI);
        api.use(opts.docsPath, express.static(swaggerUI.dist));
        callback(null);
    });
};
