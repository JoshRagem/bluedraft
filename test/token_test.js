var Tok = require('../lib/tokenizer/token'),
fs = require('fs')

stream = fs.createReadStream('./basic.blue')
t = new Tok(stream,{debug:true})
t.on('token',console.log)

console.log(t)
