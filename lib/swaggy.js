"use strict";

var swagger     = require("swagger-node-express"),
    swaggerUI   = require("swagger-ui"),
    express     = require("express"),
    async       = require("async"),
    path        = require("path"),
    util        = require("util"),
    url         = require("url"),
    fs          = require("fs"),
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
    var api;

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

    global.swagger = swagger;
    fs.readdir(opts.controllersDir, function (err, files) {
        async.each(files, function (file, done) {
            var controller;
            if (path.extname(file) !== ".js") {
                return done();
            }
            try {
                controller = require(path.join(opts.controllersDir, file));
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
            var docs = opts.docsPath;
            if (docs[docs.length - 1] !== "/") {
                docs += "/";
            }
            swagger.configure(url.resolve(opts.hostURL, opts.root), opts.apiVersion);
            api.use(docs + "index.html", renderUI);
            api.use(opts.docsPath, express.static(swaggerUI.dist));
            callback(err);
        });
    });
};
