var em = require('events').EventEmitter,
util = require('util'),
StreamWorker = require('./stream_worker')

function Reader(stream, options) {
    em.call(this)

    console.log('new reader')

    var worker = new StreamWorker(stream),
    self = this

    console.log('listening to lines')
    worker.on('lines', function(num){
        console.log('reader lines',num)
        var line, lines, i

        lines = this.getLines(num)

        for (i = 0; i < num; i++) {
            line = lines[i]
            if (!/^#/.test(line)) {
                self.emit('line',line)
            } else if (options.debug) {
                self.emit('debug',line)
            }
        }
    })
    console.log(worker,'worker')
}
util.inherits(Reader, em)

module.exports = Reader
