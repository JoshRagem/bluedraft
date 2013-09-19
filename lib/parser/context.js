var resolve = require('path').resolve,
has_color = require('has-color'),
Calor = require('calor'),
eol = require('os').EOL,
id = 0

function Context(functions) {
    var child, self = this,
    tokens = [], holder = {}

    self.id = id
    id++
    //console.log('my tokens',self.id,tokens)

    function receiveToken(tok,parent) {
        //console.log('tok',tok.type,!!~tok.value.toString().indexOf('\n')?JSON.stringify(tok.value):'')
        if (tok.type == 'open') {
            //console.log('open',self.id,'length',tokens.length,'functions',functions.length)
            process_tokens(holder,tokens,functions)
            tokens = []
            child = new Context(functions)
            self.receiveToken = passToken
        } else if (tok.type == 'end') {
            //console.log(tokens.length)
            process_tokens(holder,tokens,functions)
            parent.reset_receive()
            //console.log('tokns',tokens)
        } else if (['alter','repeat'].indexOf(tok.type) != -1) {
            holder[tok.type] = tok.value
        } else {
            //console.log('before',tokens.length,self.id)
            tokens.push(tok)
            //console.log('after',tokens.length,self.id)
        }
    }
    function passToken(tok) {
        child.receiveToken(tok,this)
    }

    this.receiveToken = receiveToken
    this.reset_receive = function(){
        self.receiveToken = receiveToken
    }

    function process_tokens() {
        //console.log('processing:',JSON.stringify(tokens))

        var i, count, tok, func, effect,
        hold = []

        effect = generators.alter(holder.alter)

        for (i=0,count=tokens.length;i<count;i++) {
            tok = tokens[i]
            //if (tok.type == 'plain') {
                //console.log('tok',JSON.stringify(tok))
            //}

            func = generators[tok.type](tok,effect)
            if (Array.isArray(func)) {
                hold = hold.concat(func)
            } else {
                hold.push(func)
            }
        }

        if (holder.repeat) {
            func = generators.repeat(holder.repeat,hold)
            hold = [{type:'dcf',func:func}]
        }
        hold.unshift.call(hold,functions.length,0)
        functions.splice.apply(functions,hold)
        //console.log(functions)
    }
    this.process_tokens = process_tokens
}

module.exports = Context

function walkUpKeyPath(obj,path) {
    //need to fix the path before this
    var i, c, key, cur = obj

    for (i=0,c=path.length;i<c;i++) {
        obj = cur
        key = path[i]
        cur = obj[key]
    }

    return cur
}

function writeOut(data,out,text,indent,level,align) {
    if (!text) {
        return
    }
    text = text.toString()
    var lines = text.split(eol),
    hold = ''
    for(i=0;i<data.level;i++){
        hold += data.indent
    }
    lines = lines.map(function(l){
        //switch (data.isTTY && data.align) {
        //    case 'l':
        //        return hold + l
        //    case 'r':
        //        return hold + l
        //    case 'c':
        //        return hold + l
        //    default:
        //        return hold + l
        //}
        return l
    })
    text = lines.join(eol+hold)

    out.write(text)
}

var alter_map = {
    'i' : 'INVERT',
    'h' : 'HIDDEN',
    'b' : 'BOLD',
    '_' : 'UNDERSCORE',
    '-' : 'STRIKE',
    'r' : 'RESET'
},

generators = {
    plain : function (tok,effect) {
        //console.log('mapping?',JSON.stringify(tok.value))
        return {
            type: 'dcf',
            func: function(data,qc){
                var text = effect(tok.value)
                if (!text){
                    return this.STACK_CONTINUE
                }
                //console.log()
                //console.log('writing:',JSON.stringify(tok.value))
                //console.log()
                writeOut(data,data.out,text,data.indent,data.level,data.align)
                return this.STACK_CONTINUE
            }
        }
    },
    global : function (tok,effect) {
        //generate the require valcfs,
        //generate the other ones
        var funcs = [], f, i, c,
        key, value,
        requires = tok.value.require || ''
        requires = requires.split(',').filter(function(v){return v})

        for (i=0,c=requires.length;i<c;i++) {
            f = requires[i]
            funcs.push({
                type: 'valcf',
                func: function(data){
                    return (data[f] != null) || "data."+f+" must be set"
                }
            })
        }
        delete tok.value.require

        for (key in tok.value) {
            value = tok.value[key]
            h = function(key,value){
                funcs.push({
                    type: 'dcf',
                    func: function(data,qc){
                        //console.log('changeing',key,'to',value)
                        data[key] = value
                        return qc.STACK_CONTINUE
                    }
                })
            }
            h.call(this,key,value)
        }
        //console.log(funcs)
        return funcs
    },
    accessor : function (tok,effect) {
        return {
            type: 'dcf',
            func: function(data,qc){
                var text = walkUpKeyPath(data,tok.value) || ''
                text = effect(text)
                writeOut(data,data.out,text,data.indent,data.level,data.align)
                return qc.STACK_CONTINUE
            }
        }
    },
    file : function (tok,effect) {
        return {
            type: 'dcf',
            func: function(data,qc){
                var path = resolve(data.root,tok.value)
                this.run(['file',path],data,{
                    end:function(){
                        qc.asyncStackContinue()
                    },
                    error:function(err){
                        qc.asyncStackError(err)
                    },
                    validateFail:function(fails){
                        qc.asyncStackError(fails)
                    }
                })
                return qc.WAIT_FOR_DATA
            }
        }
    },

    alter : function(tok) {
        var grey, hold,
        fore, back

        if (!tok || !has_color) {
            return function(text){return text}
        }

        fore = function(text){
            return text
        }
        back = function(text){
            return text
        }

        if (tok.fore) {
            if (Array.isArray(tok.fore)) {
                fore = Calor.text.apply(null,tok.fore)
            } else if (/grey:/i.test(tok.fore)) {
                grey = tok.fore.split(':')[1]
                fore = Calor.text.grey(grey)
            } else {
                hold = alter_map[tok.fore.toLowerCase()] || tok.fore.toUpperCase()
                fore = Calor.text[hold]
            }
        }
        if (tok.back) {
            if (Array.isArray(tok.back)) {
                back = Calor.text.apply(null,tok.back)
            } else if (/grey:/i.test(tok.back)) {
                grey = tok.back.split(':')[1]
                back = Calor.text.grey(grey)
            } else {
                hold = alter_map[tok.back.toLowerCase()] || tok.back.toUpperCase()
                back = Calor.background[hold]
            }
        }

        return function(text){
            var hold = back(text)
            hold = fore(hold)
            return hold
        }
    },
    repeat : function(rep, funcs) {
        var i,count,f,
        stack = {
            ValCF:[],
            DCF:[],
            VCF:[]
        }

        for (i=0,count=funcs.length;i<count;i++) {
            f = funcs[i]
            stack[f.type.replace(/[dvcf]/g,function(x){
                //console.log(x)
                return x.toUpperCase()
            })].push(f.func)
        }

        return function(data, qc){
            var parts, iter, i, it,
            stack_args = [], args

            if (rep.constructor == Number) {
                iter = []
                for (i=0;i<rep;i++) {
                    iter[i] = i+1
                }
            } else if (rep.type == 'accessor') {
                parts = rep.value
                iter = walkUpKeyPath(data,parts)
            } else {
                parts = rep.split('.')
                iter = walkUpKeyPath(data,parts)
            }

            for (i in iter) {
                it = iter[i]
                stack_args.push({
                    '#':i,
                    '@':it,
                    '*':data,
                    out:data.out,
                    indent:data.indent,
                    level:data.level,
                    align:data.align,
                    isTTY:data.isTTY,
                    width:data.width,
                    height:data.height
                })
            }

            qc.series_foreach(stack,stack_args,{
                end:function(){
                    qc.asyncStackContinue()
                },
                error:function(err){
                    qc.asyncStackError(err)
                },
                validateFail:function(fails){
                    qc.asyncStackError(fails)
                }
            })

            return qc.WAIT_FOR_DATA
        }
    }
}
