var Parser = require('../').Parser,

p = new Parser({template_dir:__dirname,debug:false})

p.compileFiles(['basic.blue','advanced.blue','ultra_basic.blue'],function(err){
    if (err) {
        console.error(err.stack)
        process.exit(1)
    }
    var args = {
        out:process.stdout,
        array:['hi','josh'],
        object:{
            'ko':'hi',
            'two':'yo'
        },
        test:{
            'one':[
                   'dou',
                   'tree'
                   ]
        },
        message:'dumb',
        root:__dirname
    }
    p.Writer.writeFileWithData('basic.blue',args,function(err,stuff){
        console.error('\n\n', err?err.stack:'done')
    })
})
