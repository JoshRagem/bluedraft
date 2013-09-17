var Tok = require('../lib/tokenizer/token'),
fs = require('fs')

stream = fs.createReadStream('./basic.blue')
t = new Tok(stream,{debug:true})
t.on('token',function(tok){console.log('token',tok.type)})

//console.log(t)
