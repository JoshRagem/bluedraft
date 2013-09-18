function Context(functions) {
    var hold = receiveToken, child, self = this

    function receiveToken(tok,parent) {
        if (tok.type == 'open') {
            console.log('opn')
            child = new Context(functions)
            hold = self.receiveToken
            self.receiveToken = passToken
        } else if (tok.type == 'end') {
            parent.reset_receive()
        }
    }
    function passToken(tok) {
        console.log('pass token')
        child.receiveToken(tok,this)
    }

    this.receiveToken = receiveToken
    this.reset_receive = function(){
        console.log('reset')
        this.receiveToken = hold
    }
}

module.exports = Context
