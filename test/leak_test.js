var keys = Object.keys(global)
require('./basic_test')
var newKeys = Object.keys(global)

console.log(keys.length,newKeys.length)
var i,k
for (i in keys) {
    k = keys[i]
    newKeys.splice(newKeys.indexOf(k),1)
}

console.log(newKeys)
