
exports.mapActions = function (qc,f){
    if (f == null) {
        f = require('./functions')
    }

    qc.command('process line')
        .dcf(
            f.scan_to_match,
            this.if_else(
                function(d){return d.text.length},
                f.emit_plain_text,
                f.set_plain_and_exit
            ),
            f.run_processing_stack,
            this.if(
                function(d){return d.text.length},
                this.defer('process line')
            )
        )

    qc.command('begin')
        .dcf(
            f.emit('open'),
            f.left_strip(2)
        )

    qc.command('read front param')
        .dstack('begin')
        .dcf(
            f.find(/\)\}/),
            f.parse_front_param,
            f.emit('alter',function(d){return d.front}),
            f.left_strip(function(d){return d.found+2})
        )
}
