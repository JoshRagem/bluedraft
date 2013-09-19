function run_recurser(stack,args,i,cbs) {
    var self = this
    //console.log('args',args)
    this.run(stack,args[i],{
        end:function(){
            i++
            if (i<args.length) {
                run_recurser.call(self,stack,args,i,cbs)
            } else {
                cbs.end.apply(this,arguments)
            }
        },
        error:function(err){
            cbs.error.apply(this,arguments)
        },
        validateFail:function(fails){
            cbs.validateFail.apply(this,arguments)
        }
    })
}

module.exports = {
    control: function(){
        var self = this

        this.series_foreach = function(stack,args,cbs){

            run_recurser.call(self,stack,args,0,cbs)

        }
    }
}
