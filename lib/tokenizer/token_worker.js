var em = require('events').EventEmiter,
util = require('util'),
eol = require('os').EOL

function TokenWorker(debug) {
    em.call(this)

    var holder = '' // buffer plain text

    processLine = function(line){

    }

    this.processLine = processLine

    ignoreLine = function(line){

    }

    this.ignoreLine = ignoreLine

    /* heavy lifters */
    var self = this

    function pull_off_plain_text(text) {
        //code
    }

    function read_front_param(param) {
        //code
    }

    function read_back_param(param) {
        //code
    }

    function read_global_param(param) {
        //code
    }

    function read_file_path(path) {
        //code
    }

    /* end lifters */
}
util.inherits(TokenWorker, em)

module.exports = TokenWorker
