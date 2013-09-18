var em = require('events').EventEmitter,
util = require('util'),
StreamWorker = require('./stream_worker')

function Reader(stream, options) {
    em.call(this)

    //console.log('new reader')

    var worker = new StreamWorker(stream),
    self = this,
    lines = [],
    waiting = false

    //console.log('listening to lines')
    worker.on('lines', function(num){
        //console.log('reader lines',num,lines)
        var line, i,
        hold = this.getLines(num)

        lines = lines.concat(hold)
        //console.log(hold,lines)

        if (!waiting) {
            waiting = true
            self.emit('line',lines.pop())
        }
    })
    worker.on('end', function(){
        lines.unshift(null)
    })

    this.readyNextLine = function(){
        if (lines.length) {
            self.emit('line',lines.pop())
        }
    }
    //console.log(worker,'worker')
}
util.inherits(Reader, em)

module.exports = Reader
