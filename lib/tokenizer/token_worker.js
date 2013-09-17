var em = require('events').EventEmitter,
QuickConnect = require('qcnode').QuickConnect
util = require('util'),
eol = require('os').EOL

function TokenWorker(debug) {
    em.call(this)

    var self = this,
    mix = require('./stacks/mixins'),
    plain = '',
    qc = new QuickConnect({mixins:mix})
    //console.log(mix,'mixins')
    require('./stacks/actions').mapActions(qc)

    processLine = function(line, cb){
        //console.log('process line')
        qc.run('process line',{text:line,emitter:self,plain:plain},{
            end:function(res){
                plain = res.plain + eol
                cb()
            },
            error:function(err){console.error(err.stack)},
            validateFail:function(fails){console.log(fails)}
        })
    }

    this.processLine = processLine

    ignoreLine = function(line){
        plain += eol + line
    }

    this.ignoreLine = ignoreLine
}
util.inherits(TokenWorker, em)

module.exports = TokenWorker
