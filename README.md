Last time I used this library it worked except for a bug where multiple layers of repeat loops did not execute all iterations of the loop correctly. This library is not maintained.

bluedraft
=========

A terminal text templating engine made of **AWESOME**.

## v0.0.1-d

bluedraft is still in beta and has some bugs that should be watched out for.

##Basic usage

bluedraft takes in text files and compiles them to executable quickconnect stacks that accept data objects.

```javascript
var Parser = require('bluedraft').Parser,
options = {template_dir:myDir,debug:false},

parsley = new Parser(options),
writer = parsley.Writer

parsley.compileFiles(fs.readdirSync(myDir), function(err){
	//handle error…
	writer.writeFileWithData('basic.blue',{},function(err,obj){
		var text = obj.text
		//yadda yadda yadda
	})
})
```

This example shows the basic usage of bluedraft.

##File syntax
`{{` and `}}` are the basic markers that will add an effect to or repeat a block of the file. These markers may be nested. If there is no effect to add, or no repeat present, these markers do not do much.

###basic examples

```
{{hello basic}}
```
The above is a super basic example of a template file. It is equivalent to `hello basic`. This file will result in `hello basic` printing to the terminal.

```
[[require:message]]
[[indent:&,level:5,align:r]]
```

These lines are altering global values. The `require` value should put in a validation step when the file is being written (but that does not seem to happen at the moment). The `indent` value sets the indentation character, it will be whatever comes before the comma (so it can't contain a comma), this includes whitespace and invisible characters (I suppose). Everything on a line after one of these markers is ignored/removed (at the moment, if this is the only text on a line, the newline is still there, so don't expect the line to disapear like a comment).

```
#basic
helol wald #{{
```

Lines that start with `#` are comments. These lines will be stripped from the file unless `options.debug == true`. `#` can be used to escape special character pairs. The `#` is removed in the final output.

```
#things don't actulaly have to be in the {{}}s
I should be able to escape file paths #./ultra_basic.blue
./ultra_basic.blue
```

To include another file, simply type `./` followed by the relative path from the `options.template_dir` path. The contents of that file will be rendered in place of the file path. While you could put this in a effected or repeated block, effects and indentation may not act like you expect.

```
{(1,2,3){helol wald}}
{(_){helol wald four times }(4)}
```

Effects (like color and underline) can be defined in paranthesis at the begining of a block marker.

`{(1,2,3){…` indicates that this text block will have the color coresponding to 1 red, 2 blue, 3 green. The terminal colorizing library [calor](https://github.com/pagodajosh/calor) is used to add these effects. `{(_){…` means the text will be underlined. `{(1,2,3,_){…` would mean that the text has that color and is underlined.

`…}(4)}` indicates that this block should be repeated 4 times. The exact text in the block is repeated, no newline is added.

Here is a complete list of the effects that can be set:

```
{
    'i' : 'INVERT',
    'h' : 'HIDDEN',
    'b' : 'BOLD',
    '_' : 'UNDERSCORE',
    '-' : 'STRIKE',
    'r' : 'RESET'
}
```

```
#access template data
{{..message}}
```

The character pair `..` will access the data object at some key path; `..my.key.path.0`. If the key path does not lead to valid value, the text is ommited (I don't remember if this removes the whole block or just that text, might be the whole block).

```
#repeats
{(i){repeat me: ..# ..@ ..*.message test
}(..array)}
#repeat object
{(i){repeat me: ..# ..@ ..*.message
}(..object)} [[level:5]]
```

Accessors can also be used in a repeat field to iterate over an array or JSON object. During a repeating block, there are some special accessors defined: `#` will access the current iteration key (array index or object key), `@` will access the current iterator value for that key, and `*` accesses the object or array that over which we are iterating. Since repetitions can be nested (not really, right now = bug.), you can have an accesor that looks like this: `..*.*.*.*.key`.
