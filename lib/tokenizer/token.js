var em = require('events').EventEmitter,
util = require('util'),
Reader = require('./reader'),
Worker = require('./token_worker')

function Tokenizer(stream, options) {
    em.call(this)
    //console.log('new tokenizer')

    var self = this,
    reader = new Reader(stream, options),
    worker = new Worker(options.debug)
    worker.on('token', function(tok){
        self.emit('token',tok)
    })

    reader.on('line', function(line){
        //console.log('reader emited line',line)
        worker.processLine(line,function(){
            reader.readyNextLine()
        })
    })

    if (options.debug) {
        reader.on('debug', function(line){
            //I have to pipe it throught the worker
            //so that it is still in the right order
            worker.ignoreLine(line)
        })
    }
    //console.log(reader,'reader')
}
util.inherits(Tokenizer, em)

module.exports = Tokenizer
