var eol = require('os').EOL,
found_map = {
        '[[' :  'read global param',
        '{(' :  'read front param',
        '}(' :  'read back param',
        './' :  'read file path',
        '..' :  'read accessor',
        '{{' :  'mark beginer'
    }

module.exports = {
    is_set : function(key){
        return function (data,qc){
            //console.log('is set',data)
            return (data[key] != null) || "data."+key+" should be set"
        }
    },

    scan_to_match : function (data, qc){
        //console.log('scan to match')
        var i, count, key, then = eol, now, hash = false,
        text = data.text

        for (i = 0, count = text.length; i<count; i++) {
            now = text[i]
            key = then+now
            if (found_map[key] && !hash) {
                data.found = i
                data.marker = key
                data.plain += eol + text.slice(0,i)
                data.text = text.slice(i)
                return qc.STACK_CONTINUE
            } else if (hash) {
                data.text = text.replace('#'+key,key)
                i = i-1
                count = count-1
            }
            hash = then == '#'
            then = now
        }
        data.plain += eol + text
        data.text = ''
        return qc.STACK_CONTINUE
    },

    emit : function (type, getter){
        return function (data, qc){
            var value = getter(data),
            token = {
                type: type,
                value: value
            }
            //console.log('emit',type)
            data.emitter.emit('token',token)
            return qc.STACK_CONTINUE
        }
    },

    exit : function(){return this.STACK_EXIT},

    run_processing_stack : function(data, qc){
        var command = found_map[data.marker]
        qc.run(command,data,{
            end:function (){
                qc.asyncStackContinue()
            },
            error:function (err){
                qc.asyncStackError(err)
            },
            validateFail:function (fails){
                qc.asyncStackError(fails)
            }
        })
        return qc.WAIT_FOR_DATA
    },

    left_strip : function(len){
        return function (data, qc){
            if (typeof len == 'function') {
                len = len(data)
            }
            data.text = data.text.slice(len-1)
            return qc.STACK_CONTINUE
        }
    },

    find : function(reg){
        return function (data, qc){
            data.find = data.text.indexOf(reg)
            return qc.STACK_CONTINUE
        }
    },

    /* reading in stuff */

    parse_front_param : function (data, qc){
        var end = data.find,
        front = data.text.slice(0,end),
        parts, fg, bg, fparts, bparts

        data.end = end

        parts = front.split('|')
        fg = parts[0]
        bg = parts[1] || ''

        data.front = {}
        fparts = fg.split(',')

        if (fparts.length >= 3) {
            data.front.fore = fparts
        } else if (parts.length == 1) {
            data.front.fore = fg
        }

        bparts = bg.split(',')

        if (bparts.length >= 3) {
            data.front.back = bparts
        } else if (bparts.length == 1) {
            data.front.back = bg
        }

        return qc.STACK_CONTINUE
    },

    parse_back_param : function (data, qc){
        var end = data.find,
        value = data.text.slice(0,end)
        if (!~value.indexOf('..')) {
            value =  parseInt(value)
            data.back = value
        } else {
            value = {
                type: 'accessor',
                value: value.splice(2).split('.')
            }
            data.back = value
        }
        return qc.STACK_CONTINUE
    },

    parse_global_param : function (data, qc){
        var end = data.find,
        params = data.text.slice(0,end),
        kvs = params.split(','),
        key, val, i, count, hold,
        value = {}

        for (i=0,count=kvs.length;i<count;i++) {
            hold = kvs[i].split(':')
            key = hold[0]
            val = hold[1]
            value[key] = val
        }
        data.global = value
        return qc.STACK_CONTINUE
    },

    parse_accessor : function (data, qc){
        var end = data.find,
        access = data.text.slice(0,end),
        accesses = access.split('.')
        data.accessor = accesses
        return qc.STACK_CONTINUE
    },

    parse_file_path : function (data, qc){
        var end = data.find,
        path = data.text.slice(0,end)
        data.file = path
        return qc.STACK_CONTINUE
    }

}
