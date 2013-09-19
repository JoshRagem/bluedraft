var fs = require('fs'),
Context = require('./context'),
Tokenizer = require('../tokenizer/token')

function Worker(writer,path,cb,debug) {
    var functions = [],
    base = new Context(functions),
    stream = fs.createReadStream(path),
    tok = new Tokenizer(stream, {debug:!!debug}),
    eventer = function(tokn){
        //console.log('tokn',tokn)
        if (tokn === null) {
            //console.log('end')
            writer.addFile(path,functions)
            cb()
            return
        }

        base.receiveToken(tokn,{
            reset_receive:function(){
                tok.removeListener('token',eventer)
                cb(new Error("unmatched close"))
            }
        })
    }

    tok.on('token',eventer)
}

module.exports = Worker
