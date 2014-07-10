swaggy
======

An automation extension for [swagger-node-express](https://github.com/wordnik/swagger-node-express) module.

This module automates the registration of REST endpoints and data models and structures the project in a bit more opinionated manner.  The module also embeds Swagger UI, which is immediately available to use. It allows you to start Swagger with fewer lines of code, zero configuration and streamlines the writing of controllers.

Installation
---------------

    $ npm install swaggy

Example
-------

The main .js file would look something like this:
```js
    var express     = require("express"),
        bodyParser  = require("body-parser"),
        swaggy      = require("swaggy"),
        app         = express();

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
            // Access Swagger UI
            console.log("REST API available at http://localhost:3001/api/docs");
        });
    });
```
Then create a subdirectory named `rest-api`, this is the default root for controllers.

Example controller (/rest-api/accounts.js):
```js
    // Define your data trasfer objects.
    exports.models = {
        Account: {
            id: "Account",
            description: "User account information.",
            properties: {
                _id         : { type: "number" },
                prefix      : { type: "string" },
                givenName   : { type: "string" },
                surname     : { type: "string" },
                age         : { type: "number" },
                gender      : { type: "number" }
            }
        }
    };

    // Define an endpoint.
    exports.getAccounts = {
        spec: {
            description: "Accounts Operations",
            path: "/accounts",
            notes: "Returns all user accounts.",
            summary: "Get all accounts.",
            method: "GET",
            type: "array",
            items: {
                type: "Account"
            },
            nickname: "getAccounts"
        },
        action: function (req, res) {
            // Let's pretend we have some accounts retrieved from database.
            res.json(accounts);
        }
    };
```
And you are ready to go.

There are working examples at: [https://github.com/rabchev/swaggy/tree/master/examples](https://github.com/rabchev/swaggy/tree/master/examples)

API Reference
-------------

** swaggy(app, opts, callback); **

 - **app** (required) - Express application instance.
 - **opts** (optional) - Configuration options. See the table below for all supported options.
 - **callback** (optional) - Called upon initialization completion. The callback has two parameters. The first parameter will contain an Error object if an error occurred, or null otherwise. While, the second parameter will be the Swagger instance that was attached to the app if it was successfully initialized.

License
-------

(MIT License)

Copyright (c) 2012 Boyan Rabchev <boyan@rabchev.com>. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
