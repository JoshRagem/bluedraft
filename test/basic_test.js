var Parser = require('../lib/parser/Parser'),

p = new Parser({template_dir:__dirname,debug:true})

p.compileFiles(['basic.blue','advanced.blue'],function(err){
    //console.error(arguments)
    p.Writer.writeFileWithData('basic.blue',{out:process.stdout,array:['hi'],message:'dumb',root:__dirname},function(err,stuff){
        console.error('\n\n', err?err.stack:'done')
    })
})
