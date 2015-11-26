# node-ttyread
Gather input from a terminal

The module provides a similar API to the "read" module, but it
doesn't use the readline builtin and it reads input directly
from a tty device.  This is useful if you need to support the
ability to redirect stdio, but also need to read input from a
user (not from stdin).  Attempts to adapt a few other packages
to do this properly failed, hence ttyread.  This module has been
tested with nodejs 0.10 and later releases.

## USAGE

```javascript
var ttyread = require("ttyread")
ttyread(prompt, options, callback)
```

The prompt can be omitted or specified as an option.  The options
argument can also be omitted.  The first argument passed to the 
callback is an error if one occurs.  The second argument is the 
user input.  If the user cancels the input, both the error and
result arguments will be undefined.

## OPTIONS

Every option is optional.  These options are meant to be compatible
with the "read" module, but not every feature of that module is
supported.

* `prompt` What to write to stdout before reading input.
* `silent` Don't echo the output as the user types it.
* `replace` Replace silenced characters with the supplied character value.
* `default` The default value if the user enters nothing.
* `device` The path to the device file. (default `/dev/tty`)

If replace is set, silent is implied.  Replace can be set to an
empty string and have the same effect as setting silent to true.
