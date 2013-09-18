var Calor = require('calor'),
eol = require('os').EOL

function Context(functions) {
    var hold = receiveToken, child, self = this,
    tokens = [], holder = {}

    function receiveToken(tok,parent) {
        if (tok.type == 'open') {
            child = new Context(functions)
            hold = self.receiveToken
            self.receiveToken = passToken
        } else if (tok.type == 'end') {
            process_tokens(holder,tokens,functions)
            parent.reset_receive()
        } else if (['alter','repeat'].indexOf(tok.type) != -1) {
            holder[tok.type] = tok.value
        } else {
            tokens.push(tok)
        }
    }
    function passToken(tok) {
        child.receiveToken(tok,this)
    }

    this.receiveToken = receiveToken
    this.reset_receive = function(){
        this.receiveToken = hold
    }

    function process_tokens(singles,tokens,functions) {
        var i, count, tok, func, effect,
        hold = []

        if (singles.alter) {
            effect = generators.alter(effect)
        }

        for (i=0,count=tokens.length;i<count;i++) {
            tok = tokens[i]
            func = generators[tok.type](tok,effect)
            if (Array.isArray(func)) {
                hold = hold.concat(func)
            } else {
                hold.push(func)
            }
        }

        if (singles.repeat) {

        }
    }
}

module.exports = Context

var generators = {
    plain : function (tok,effect) {
        return {
            type: 'dcf',
            func: function(data,qc){
                var text = effect(tok.value),
                lines = text.split(eol)

                lines = lines.map(function(l){
                    switch (data.isTTY && data.align) {
                        case l:
                            return data.indent + l
                        case r:
                            return data.indent + l
                        case c:
                            return data.indent + l
                        default:
                            return data.indent + l
                    }
                })
                text = lines.join(eol)

                data.out.write(text)
                return this.STACK_CONTINUE
            }
        }
    },
    global : function (tok,effect) {
        //generate the require valcfs,
        //generate the other ones
        return [
            {
                type: 'valcf',
                func: function(data,qc){}
            },
            {
                type: 'dcf',
                func: function(data,qc){}
            }
        ]
    },
    accessor : function (tok,effect) {
        return {
            type: 'dcf',
            func: function(data,qc){
            }
        }
    },
    file : function (tok,effect) {
        return {
            type: 'dcf',
            func: function(data,qc){
            }
        }
    },

    alter : function(tok) {
        var grey, hold,
        fore = function(text){
            return text
        },
        back = function(text){
            return text
        }

        if (!tok) {
            return function(text){return text}
        }
        if (tok.fore) {
            if (Array.isArray(tok.fore)) {
                fore = Calor.text.apply(null,tok.fore)
            } else if (/grey:/i.test(tok.fore)) {
                grey = tok.fore.split(':')[1]
                fore = Calor.text.grey(grey)
            } else {
                hold = alter_map[tok.fore.toLowerCase()] || tok.fore.toUpperCase()
                fore = Calor[hold]
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
                back = Calor[hold]
            }
        }

        return function(text){
            var hold = back(text)
            hold = fore(hold)
            return hold
        }
    }
},

alter_map = {
    'i' : 'INVERT',
    'h' : 'HIDDEN',
    'b' : 'BOLD',
    '_' : 'UNDERSCORE',
    '-' : 'STRIKE',
    'r' : 'RESET'
}
