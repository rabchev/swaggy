/**
 * An automation extension for swagger-node-express module.
 *
 * @module swaggy
 */

"use strict";

var Swagger     = require("swagger-node-express"),
    swaggerUI   = require("swagger-ui"),
    express     = require("express"),
    path        = require("path"),
    walk        = require("walk"),
    util        = require("util"),
    fs          = require("fs"),
    _           = require("lodash"),
    Strings     = require("./strings"),
    defaults    = {
        root: "/api",
        docsPath: "/docs",
        resourcePath: "/api-docs",
        format: "",
        suffix: "",
        controllersDir: path.resolve("rest-api"),
        apiVersion: "1.0"
    };

global.Swagger = Swagger;

function addLeadingSlash(path) {
    return path[0] !== "/" ? "/" + path : path;
}

function removeLeadingSlash(path) {
    return path[0] === "/" ? path.substr(1) : path;
}

function addTrailingSlash(path) {
    return path[path.length - 1] !== "/" ? path + "/" : path;
}

function removeTrailingSlash(path) {
    return path[path.length - 1] === "/" ? path.substr(0, path.length - 1) : path;
}

/**
 * Creates new Swagger instance, initializes it with provided or default options,
 * registers all found endpoints and attaches the Swagger instance to the provided app.
 *
 * Options
 *
 * - `root` {string} - The base path for the REST API. Defaults to "/api".
 * - `controllersDir` {string} - The root directory for API controllers, modules exposing REST endpoints.
 *  Defaults to `process.cwd() + "/rest-api"`.
 * - `apiVersion` {string} - The semantic version of the API. Defaults to 1.0.
 * - `docsPath` {string} - The URL at which the Swagger user interface will be accessible.
 *  Defaults to "/docs". NOTE: this path is relative to the `root` option.
 * - `resourcePath` {string} - The URL of the API discovery service. Defaults to "/api-docs".
 * - `format` {string} - Specifies whether file extensions (.json) should be assigned to REST endpoints.
 *  Defaults to empty string, extesions will not be used.
 * - `sufix` {string} - Defines the actual extension. Defaults to empty stirng.
 *
 * @param {Express} app - An instance of Express application object.
 * @param {object=} opts - Initialization options. Please see the description above.
 * @param {function=} callback - If provided will be called upon initialization completion.
 * The first parameter will contain an Error object if an error occurred, or null otherwise.
 * While the second parameter will be the Swagger instance that was attached to the app if successfully initialized.
 * @return {null}
 */
module.exports = function (app, opts, callback) {
    var swagger,
        walker,
        error,
        html,
        api;

    function handleIndex(req, res, next) {
        if (req.url !== "/" && req.url !== "/index.html") {
            return next();
        }

        if (req.originalUrl === opts.docsUrl) {
            return res.redirect(301, opts.docsUrl + "/");
        }

        if (html) {
            return res.send(html);
        }

        fs.readFile(swaggerUI.dist + "/index.html", { encoding: "utf8"}, function (err, data) {
            if (err) {
                util.error(err);
                return res.send(500);
            }

            html = data.replace("http://petstore.swagger.wordnik.com/api/api-docs", opts.root + opts.resourcePath);
            res.send(html);
        });
    }

    if (!app) {
        throw new Error(util.format(Strings.REQUIRED_ARG, "app"));
    }

    if (typeof opts === "function") {
        callback = opts;
        opts = null;
    }

    if (!callback) {
        callback = function (err) {
            if (err) {
                throw err;
            }
        };
    }

    opts = _.defaults(opts || {}, defaults);
    opts.resourcePath = removeTrailingSlash(addLeadingSlash(opts.resourcePath));
    opts.docsPath = removeTrailingSlash(addLeadingSlash(opts.docsPath));
    opts.root = removeTrailingSlash(addLeadingSlash(opts.root));
    opts.docsUrl = addTrailingSlash(opts.root) + removeLeadingSlash(opts.docsPath);

    if (opts.root === "") {
        api = app;
    } else {
        api = express();
        app.use(opts.root, api);
    }

    if (Swagger.createNew.length === 0) {
        // The old way
        swagger = Swagger.createNew();
        swagger.setAppHandler(api);
    } else {
        // The new way
        swagger = Swagger.createNew(api);
    }

    swagger.configureSwaggerPaths(opts.format, opts.resourcePath, opts.suffix);

    if (opts.headers) {
        swagger.setHeaders = function setHeaders(res) {
            _.forOwn(opts.headers, function (val, key) {
                res.header(key, val);
            });
        };
    }

    walker = walk.walk(opts.controllersDir);
    walker.on("file", function (dir, stats, next) {
        if (error || path.extname(stats.name) !== ".js") {
            return next();
        }

        var controller = require(path.join(dir, stats.name));
        if (controller.models) {
            swagger.addModels(controller);
            // Avoid warnings in discover method.
            delete controller.models;
        }
        if (controller.init) {
            controller.init(swagger, opts, function (err) {
                if (err) {
                    error = err;
                } else {
                    swagger.discover(controller);
                }
                next();
            });
        } else {
            swagger.discover(controller);
            next();
        }
    });

    walker.on("end", function () {
        if (error) {
            return callback(error);
        }

        api.use(opts.docsPath + "/index.html", handleIndex);
        api.use(opts.docsPath + "/", handleIndex);
        api.use(opts.docsPath, express.static(swaggerUI.dist));

        callback(null, swagger);

//      For whatever reason this must be the last Swagger API call.
        swagger.configure("/", opts.apiVersion);
    });
};
