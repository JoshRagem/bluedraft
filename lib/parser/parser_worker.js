var fs = require('fs'),
Context = require('./context'),
Tokenizer = require('../tokenizer/token')

function Worker(writer,path,cb,debug) {
    var functions = [],
    base = new Context(functions),
    stream = fs.createReadStream(path)
    tok = new Tokenizer(stream, {debug:!!debug}),
    hold = base.receiveToken,
    eventer = function(tokn){
        base.receiveToken(tokn,{
            reset_receive:function(){
                tok.removeListener('token',eventer)
                cb(new Error("unmatched close"))
            }
        })
    }
    ender = function(){
        console.log('endeded')
    }

    tok.on('token',eventer)
    tok.on('end',ender)
}

module.exports = Worker
