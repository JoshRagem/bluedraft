function Context(functions) {
    var hold = receiveToken, child, self = this

    function receiveToken(tok,parent) {
        if (tok.type == 'open') {
            child = new Context(functions)
            hold = self.receiveToken
            self.receiveToken = passToken
        } else if (tok.type == 'end') {
            parent.reset_receive()
        }
    }
    function passToken(tok) {
        child.receiveToken(tok,this)
    }

    this.receiveToken = receiveToken
    this.reset_receive = function(){
        this.receiveToken = hold
    }
}

module.exports = Context
