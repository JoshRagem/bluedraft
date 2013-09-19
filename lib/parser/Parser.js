var Writer = require('./Writer'),
worker = require('./parser_worker'),
resolve = require('path').resolve

function Parser(options) {
    this.Writer = new Writer(options.template_dir)

    function compileFile(path,cb){
        path = resolve(options.template_dir,path)
        new worker(this.Writer,path,cb,options.debug)
    }
    this.compileFile = compileFile

    function compileFiles(files,cb){
        var self = this, count = 0, errs = []
        files.forEach(function(file){
            count++
            file = resolve(options.template_dir,file)
            self.compileFile(file,function(err){
                if (err) {
                    errs.push(err)
                }
                count--
                if (!count) {
                    cb(errs.length?errs:null)
                }
            })
        })
    }
    this.compileFiles = compileFiles
}

module.exports = Parser
