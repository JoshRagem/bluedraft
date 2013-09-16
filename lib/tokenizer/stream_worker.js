var em = require('events').EventEmiter,
util = require('util')

function StreamWorker(stream) {
    em.call(this)

    var lines

    lines = []
    stream.on('readable', function(){
        var bytes, split
        bytes = this.read()
        if (bytes) {
            split = bytes.toString().split(/\r?\n/)
            split.forEach(function(v){lines.unshift(v)})
        }
        if (lines.length) {
            this.emit('lines',lines.length)
        }
    })
    this.getLines = function(num){
        if (null == num) {
            num = lines.length
        }
        lines.splice(-num,num)
    }
}
util.inherit(StreamWorker, em)

module.exports = StreamWorker
