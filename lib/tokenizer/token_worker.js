var em = require('events').EventEmiter,
QuickConnect = require('qcnode')
util = require('util'),
eol = require('os').EOL

function TokenWorker(debug) {
    em.call(this)

    var self = this,
    mix = require('./stacks/mixins'),
    qc = new QuickConnect({mixins:mix})
    require('./stacks/actions').mapActions(qc)

    plain = '', // buffer plain text
    working = '' //buffer working text

    processLine = function(line, num){
        var plain_i, found, actor,
        ret = pull_off_plain_text(line)

        plain_i = ret.to
        found = ret.token

        plain += eol + line.splice(0,plain_i)
        if (line.length) {
            self.emit('token',{
                type: 'plain',
                value: plain
            })
            holder = ''
            actor = found_map[found]
            actor(line, function(text){
                if (text.length){
                    processLine(text)
                }
            })
        }
    }

    this.processLine = processLine

    ignoreLine = function(line){
        plain += eol + line
    }

    this.ignoreLine = ignoreLine

    /* heavy lifters */
    var found_map = {
        '[[' :  read_global_param,
        '{(' :  read_front_param,
        '}(' :  read_back_param,
        './' :  read_file_path,
        '..' :  read_accessor,
        '{{' :  mark_beginer
    }

    function pull_off_plain_text(text) {
        var i, count, key, then = eol, now, hash = false

        for (i = 0, count = text.length; i<count; i++) {
            now = text[i]
            key = then+now
            if (found_map[key] && !hash) {
                return {to:i,found:key}
            } else if (hash) {
                text.splice(i-2,1)
                i = i-1
            }
            hash = then == '#'
            then = now
        }
        return {to:i,found:null}
    }

    function mark_beginer(text, cb) {
        self.emit('token',{type:'open'})
        test.splice(0,2)

        cb(text)
    }

    function read_front_param(text, cb) {
        mark_beginer(text, function(t){
            var end_i = text.indexOf(/\)\}/)
            if (!t.length || !!~end_i){
                throw new SyntaxError('Line end in front param')
            }
        })
    }

    function read_back_param(text, cb) {
        //code
    }

    function read_global_param(text, cb) {
        //code
    }

    function read_accessor(text, cb) {
        //code
    }

    function read_file_path(text, cb) {
        //code
    }

    /* end lifters */
}
util.inherits(TokenWorker, em)

module.exports = TokenWorker
