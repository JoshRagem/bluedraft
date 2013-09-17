module.exports = {
    command : function(){
        this.if_else = function(check,yes,no){
            return function(data,qc){
                if (check(data)) {
                    return yes.apply(this,arguments)
                } else {
                    return no.apply(this,arguments)
                }
            }
        }
        this.if = function(check,yes){
            return function(data,qc){
                if (check(data)) {
                    return yes.apply(this,arguments)
                } else {
                    return qc.STACK_CONTINUE
                }
            }
        }
        this.defer = function(cmd,local){
            return function(data,qc){
                if (local == null) {
                    local = qc
                }
                local.run(cmd,data,{
                    end:function(){qc.asyncStackContinue()},
                    error:function(err){qc.asyncStackError(err)},
                    validateFail:function(fails){qc.asyncStackError(fails)}
                })
                return qc.WAIT_FOR_DATA
            }
        }
    }
}
