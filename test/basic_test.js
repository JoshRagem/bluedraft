var Parser = require('../lib/parser/Parser'),

p = new Parser({template_dir:__dirname,debug:true})

p.compileFile('basic.blue',function(err){
    console.error(arguments)
})
