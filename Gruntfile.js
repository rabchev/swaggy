/*jshint -W106 */

"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        jsdoc: {
            dist: {
                src: ["./server", "README.md"],
                options: {
                    destination: "./cache/docs",
                    tutorials: "./cache/docs/tutorials",
                    template: "./node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure: "./jsdoc.json"
                }
            }
        },
        "gh-pages": {
            options: {
                base: "./cache/docs"
            },
            src: ["**"]
        },
        simplemocha: {
            options: {
                timeout: 3000,
                ignoreLeaks: false,
                globals: ["Swagger"],
                reporter: "spec"
            },
            all: {
                src: ["./test/*_test.js"]
            },
            swaggy: {
                src: ["./test/swaggy_test.js"]
            }
        },
        shell: {
            debug: {
                options: {
                    stdout: true
                },
                command: function (target) {
                    if (process.platform === "win32") {
                        return "grunt-debug test:" + target;
                    }

                    return "node --debug-brk $(which grunt) test:" + target;
                }
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            debug_all: ["node-inspector", "shell:debug:all"],
            debug_swaggy: ["node-inspector", "shell:debug:swaggy"]
        },
        "node-inspector": {
            "default": {}
        },
        release: {
            options: {
                npm: false
            }
        }
    });

    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-release");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-node-inspector");
    grunt.loadNpmTasks("grunt-simple-mocha");

    grunt.registerTask("test", function () {
        var arg = "all";
        if (this.args && this.args.length > 0) {
            arg = this.args[0];
        }

        grunt.task.run(["simplemocha:" + arg]);
    });

    grunt.registerTask("test-debug", function () {
        var arg = "all";
        if (this.args && this.args.length > 0) {
            arg = this.args[0];
        }

        grunt.task.run(["concurrent:debug_" + arg]);
    });

    grunt.registerTask("docs", ["jsdoc", "gh-pages"]);
};
