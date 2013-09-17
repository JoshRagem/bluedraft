
exports.mapActions = function (qc,f){
    if (f == null) {
        f = require('./functions')
    }

    qc.command('process line')
        .valcf(
            f.is_set('text'),
            f.is_set('plain'),
            f.is_set('emitter')
        )
        .dcf(
            f.scan_to_match,
            this.if_else(
                function(d){return d.text.length},
                f.emit('plain',function(d){return d.plain}),
                f.exit
            ),
            f.run_processing_stack,
            this.if(
                function(d){return d.text.length},
                this.defer('process line')
            )
        )

    qc.command('mark beginer')
        .dcf(
            f.emit('open'),
            f.left_strip(2)
        )

    qc.command('read front param')
        .dstack('mark beginer')
        .dcf(
            f.left_strip(2),
            f.find(/\)\}/),
            f.parse_front_param,
            f.emit('alter',function(d){return d.front}),
            f.left_strip(function(d){return d.end+2})
        )

    qc.command('read back param')
        .dcf(
            f.left_strip(2),
            f.find(/\)\}/),
            f.parse_back_param,
            f.emit('repeat',function(d){return d.back}),
            f.left_strip(function(d){return d.end+2})
        )

    qc.command('read global command')
        .dcf(
            f.left_strip(2),
            f.find(/\]\]/),
            f.parse_global_param,
            f.emit('global',function(d){return d.global}),
            f.left_strip(function(d){return d.text.length})
        )

    qc.command('read accessor')
        .dcf(
            f.left_strip(2),
            f.find(/\s/),
            f.parse_accessor,
            f.emit('accessor',function(d){return d.accessor}),
            f.left_strip(function(d){return d.end})
        )

    qc.command('read file path')
        .dcf(
            f.find(/\s/),
            f.parse_file_path,
            f.emit('file',function(d){return d.file}),
            f.left_strip(function(d){return d.end})
        )
}
