"use strict";

// Simulate some data
var accounts    = [
        {
            _id: 0,
            title: "Ms",
            name: "Gabrielle Alden",
            age: 33,
            gender: "female"
        },
        {
            _id: 0,
            title: "Mr",
            name: "Harry Pearson",
            age: 44,
            gender: "male"
        }
    ];

// http://json-schema.org/draft-04/schema#
exports.models = {
    Account: {
        id: "Account",
        description: "User account information.",
        properties: {
            _id     : { type: "number" },
            title   : { type: "string" },
            name    : { type: "string" },
            age     : { type: "number" },
            gender  : { type: "number" }
        }
    }
};

exports.getAccounts = {
    spec: {
        description: "Accounts Operations",
        path: "/v2/accounts",
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
        res.json(accounts);
    }
};
