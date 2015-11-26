var fs = require('fs');
var tty = require('tty');

function ttyread(prompt, opts, callback) {
  var input;
  var output;

  // prompt and opts are both optional
  if (!callback) {
    if (!opts) {
      callback = prompt;
      prompt = undefined;
      opts = {};
    } else {
      callback = opts;
      if(typeof prompt !== 'string') {
        opts = prompt;
        prompt = undefined;
      } else {
        opts = {};
      }
    }
  }
  if(!prompt && opts.prompt) prompt = opts.prompt;
  if(opts.replace) opts.silent = true;
  if(opts.replace === '') {
    opts.silent = true;
    opts.replace = undefined;
  }
  opts.device = opts.device || '/dev/tty';

  input = tty.ReadStream(fs.openSync(opts.device, 'r'))
  output = tty.WriteStream(fs.openSync(opts.device, 'w'));

  // write the prompt (if one was given)
  prompt && output.write(prompt);

  var password = '';
  function processChar(ch) {
    ch = ch + "";

    switch (ch) {
    case "\n":
    case "\r":
    case "\u0004":
      // They've finished typing their password
      output.write('\n');
      closeInput();
      if(opts.default && (password === '')) {
        callback(null, opts.default);
      } else {
        callback(null, password);
      }
      break;
    case "\u0003":
      // Ctrl-C
      closeInput();
      callback();
      break;
    default:
      // More passsword characters
      if(opts.silent) {
        if(opts.replace) output.write(opts.replace);
      } else {
        output.write(ch);
      }
      password += ch;
      break;
    }
  };

  function closeInput() {
    input.removeListener('data', processChar);
    input.setRawMode(false);
    input.end();
  };

  input.setRawMode(true);
  input.setEncoding('utf8');
  input.on('data', processChar);
};

module.exports = ttyread;
