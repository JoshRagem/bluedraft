var Parser = require('../lib/parser/Parser'),

p = new Parser({template_dir:__dirname,debug:false})

p.compileFiles(['basic.blue','advanced.blue','ultra_basic.blue'],function(err){
    if (err) {
        console.error(err.stack)
        process.exit(1)
    }
    p.Writer.writeFileWithData('basic.blue',{out:process.stdout,array:['hi'],message:'dumb',root:__dirname},function(err,stuff){
        console.error('\n\n', err?err.stack:'done')
    })
})
