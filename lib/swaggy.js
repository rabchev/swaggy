"use strict";

var Swagger     = require("swagger-node-express"),
    swaggerUI   = require("swagger-ui"),
    express     = require("express"),
    path        = require("path"),
    walk        = require("walk"),
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

global.Swagger = Swagger;

module.exports = function (app, opts, callback) {
//  Currently we cannot use multiple instances of Swagger but hopefully soon it will be possible.
    var swagger = Swagger,
        walker,
        error,
        html,
        api;

    function renderUI(req, res) {
        if (html) {
            return res.write(html);
        }

        fs.readFile(swaggerUI.dist + "/index.html", { encoding: "utf8"}, function (err, data) {
            if (err) {
                util.error(err);
                return res.send(500);
            }

            html = data.replace("http://petstore.swagger.wordnik.com/api/api-docs", url.resolve(opts.hostURL, opts.root) + opts.resourcePath);
            res.write(html);
        });
    }

    function addMethods(controller, name) {
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
                        if (val.spec.method) {
                            error = new Error(util.format(Strings.INVALID_HTTP_METHOD, key, name));
                        } else {
                            error = new Error(util.format(Strings.NO_HTTP_METHOD, key, name));
                        }
                        return false;
                }
            }
        });
    }

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

    walker = walk.walk(opts.controllersDir);
    walker.on("file", function (root, stats, next) {
        if (error || path.extname(stats.name) !== ".js") {
            return next();
        }

        var controller = require(path.join(opts.controllersDir, stats.name));
        if (controller.init) {
            controller.init(function (err) {
                if (err) {
                    error = err;
                } else {
                    addMethods(controller, stats.name);
                }
                next();
            });
        } else {
            addMethods(controller, stats.name);
            next();
        }
    });

    walker.on("end", function () {
        if (!error) {
            return callback(error);
        }

        var docs = opts.docsPath;
        if (docs[docs.length - 1] !== "/") {
            docs += "/";
        }
        swagger.configure(url.resolve(opts.hostURL, opts.root), opts.apiVersion);
        api.get(docs + "index.html", renderUI);
        api.use(opts.docsPath, express.static(swaggerUI.dist));
        callback();
    });
};
