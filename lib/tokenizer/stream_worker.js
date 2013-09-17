var em = require('events').EventEmitter,
util = require('util')

function StreamWorker(stream) {
    em.call(this)

    //console.log('stream worker')

    var lines, self = this

    lines = []
    stream.on('readable', function(){
        var bytes, split
        //console.log('readable stream')
        bytes = this.read()
        //console.log(bytes.toString().length, 'bytes length')
        if (bytes) {
            split = bytes.toString().split(/\r?\n/)
            split.forEach(function(v){lines.unshift(v)})
        }
        if (lines.length) {
            //console.log(lines.length,'number of lines')
            self.emit('lines',lines.length)
        }
    })
    this.getLines = function(num){
        //console.log('get lines',num,lines)
        if (null == num) {
            num = lines.length
        }
        return lines.splice(-num,num)
    }
}
util.inherits(StreamWorker, em)

module.exports = StreamWorker
