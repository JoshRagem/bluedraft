var em = require('events').EventEmiter,
util = require('util'),
Reader = require('./reader'),
Worker = require('./token_worker')

function Tokenizer(stream, options) {
    em.call(this)

    var reader = new Reader(stream, options),
    worker = new Worker(options.debug)
    worker.on('token', function(tok){
        this.emit('token',tok)
    })

    reader.on('line', function(line){
        worker.processLine(line)
    })

    if (options.debug) {
        reader.on('debug', function(line){
            //I have to pipe it throught the worker
            //so that it is still in the right order
            worker.ignoreLine(line)
        })
    }
}
util.inherits(Reader, em)

module.exports = Reader
