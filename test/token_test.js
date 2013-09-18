var Tok = require('../lib/tokenizer/token'),
resolve = require('path').resolve,
fs = require('fs')

stream = fs.createReadStream(resolve(__dirname,'basic.blue'))
t = new Tok(stream,{debug:true})
t.on('token',function(tok){
    console.log('token',tok.type,tok.value)
})

//console.log(t)
