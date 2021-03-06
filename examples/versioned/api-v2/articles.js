"use strict";

var _           = require("lodash"),
    articles    = [],
    count       = 0;

// http://json-schema.org/draft-04/schema#
exports.models = {
    Article: {
        id: "Article",
        required: ["_id"],
        description: "An entity of content.",
        properties: {
            _id: {
                type: "integer"
            },
            title: {
                type: "string"
            },
            author: {
                type: "string"
            },
            content: {
                type: "string"
            }
        }
    }
};

exports.addArticle = {
    spec: {
        description: "Articles Operations",
        path: "/articles",
        parameters : [
            Swagger.bodyParam("article", "The article.", "Article")
        ],
        notes: "Adds new articles.",
        summary: "Add new articles.",
        method: "POST",
        type: "Article",
        nickname: "addArticle"
    },
    action: function (req, res) {
        var article = req.body;
        article._id = count++;
        articles.push(article);
        res.json(article);
    }
};

exports.getArticles = {
    spec: {
        description: "Articles Operations",
        path: "/articles",
        notes: "Returns all published articles.",
        summary: "Get all articles.",
        method: "GET",
        type: "array",
        items: {
            type: "Article"
        },
        nickname: "getArticles"
    },
    action: function (req, res) {
        res.json(articles);
    }
};

exports.getArticle = {
    spec: {
        description: "Articles Operations",
        path: "/articles/{id}",
        parameters : [Swagger.pathParam("id", "The ID of the article to get", "number")],
        notes: "Returns the article with the specified ID.",
        summary: "Get article by ID.",
        method: "GET",
        type: "Article",
        nickname: "getArticle"
    },
    action: function (req, res) {
        res.json(_.find(articles, { _id: +req.params.id }));
    }
};

exports.updateArticle = {
    spec: {
        description: "Articles Operations",
        path: "/articles",
        parameters : [
            Swagger.bodyParam("article", "The article to update", "Article")
        ],
        notes: "Updates the specified article.",
        summary: "Update article.",
        method: "PUT",
        type: "Article",
        nickname: "updateArticle"
    },
    action: function (req, res) {
        var article = _.find(articles, { _id: req.body._id });
        _.merge(article, req.body);
        res.json(article);
    }
};

exports.deleteArticle = {
    spec: {
        description: "Articles Operations",
        path: "/articles/{id}",
        parameters : [Swagger.pathParam("id", "The ID of the article to delete", "number")],
        notes: "Deletes the article with the specified ID.",
        summary: "Delete article by ID. Returns 1 if item was deleted otherwise it returns 0.",
        method: "DELETE",
        type: "number",
        nickname: "deleteArticle"
    },
    action: function (req, res) {
        var idx     = _.findIndex(articles, { _id: +req.params.id }),
            count   = 0;

        if (idx > -1) {
            articles.splice(idx, 1);
            count = 1;
        }
        res.send(count);
    }
};
