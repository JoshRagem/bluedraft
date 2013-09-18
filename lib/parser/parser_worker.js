var fs = require('fs'),
Context = require('./context'),
Tokenizer = require('../tokenizer/token')

function Worker(writer,path,cb,debug) {
    var functions = [],
    base = new Context(functions),
    stream = fs.createReadStream(path)
    tok = new Tokenizer(stream, {debug:!!debug}),
    hold = base.receiveToken,
    eventer = function(tok){
        console.log('tok',tok.type)
        base.receiveToken(tok)
    }

    base.receiveToken = function(tokn){
        if (tokn.type == 'end') {
            cb(new Error("unmatched close"))
            tok.removeListener('token',eventer)
        } else {
            hold.apply(this,arguments)
        }
    }

    tok.on('token',eventer)
}

module.exports = Worker
