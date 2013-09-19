var QuickConnect = require("qcnode").QuickConnect,
mix = require('./mixins'),
resolve = require('path').resolve

function Writer(dir) {
    var qc = new QuickConnect({mixins:mix}),
    files = qc.isolate('file'),
    file_map = {}

    function writeFileWithData(path,data,cb){
        data.indent?true:data.indent='    '
        data.level?true:data.level=0

        path = resolve(dir,path)
        qc.run(['file',path],data,{
            end:function(r){cb(null,{text:r.text})},
            error:function(err,r){cb(err,{text:r.text})},
            validateFail:function(fails,r){cb(fails,{text:r.text})}
        })
    }
    this.writeFileWithData = writeFileWithData

    function addFile(file,funcs) {
        var i, count, func, type,
        stack = files.command(file)
        //console.log('adding file',file,funcs.length)

        for (i=0,count=funcs.length;i<count;i++) {
            func = funcs[i].func
            type = funcs[i].type
            stack[type](func)
        }
    }
    this.addFile = addFile
}

module.exports = Writer
