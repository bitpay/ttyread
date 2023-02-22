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
  if(opts.replace) opts.silent = false;
  if(opts.replace === '') {
    opts.silent = true;
    opts.replace = undefined;
  }
  opts.device = opts.device || '/dev/tty';

  input = tty.ReadStream(fs.openSync(opts.device, 'r'))
  output = tty.WriteStream(fs.openSync(opts.device, 'w'));

  // write the prompt (if one was given)
  prompt && output.write(prompt);

  var result = '';
  function processChar(ch) {
    ch = ch + "";

    switch (ch) {
    case "\u001b[A":
    case "\u001b[B":
    case "\u001b[D":
    case "\u001b[C":
      // ignore attempts to use cursor keys
      break;
    case "\n":
    case "\r":
    case "\u0004":
      // They've finished typing their answer
      output.write('\n');
      closeInput();
      closeOutput();
      if(opts.default && (result === '')) {
        callback(null, opts.default);
      } else {
        callback(null, result);
      }
      break;
    case "\u0008":
    case "\u007F":
      // backspace
      if(result.length > 0) {
        result = result.slice(0,-1);
        refreshLine();
      }
      break;
    case "\u0003": // Ctrl-C
      kill('SIGINT');
      break;
    case "\u001c": // Ctrl-\
      kill('SIGQUIT');
      break;
    case "\u001a": // Ctrl-Z
      kill('SIGTSTP');
      break;
    default:
      // More passsword characters
      if(opts.replace) {
        output.write(opts.replace);
      } else if(!opts.silent) {
        output.write(ch);
      }
      result += ch;
      break;
    }
  };

  function closeInput() {
    input.removeListener('data', processChar);
    input.destroy();
  };

  function closeOutput() {
    output.destroy();
  };

  function kill(signal) {
    closeInput();
    closeOutput();
    process.kill(process.pid, signal);
    callback();
  };

  function clearScreenDown() {
    output.write('\x1b[0J');
  };

  function cursorTo(x, y) {
    if(typeof y !== 'number') {
      output.write('\x1b[' + (x + 1) + 'G');
    } else {
      output.write('\x1b[' + (y + 1) + ';' + (x + 1) + 'H');
    }
  };

  function refreshLine() {
    cursorTo(0);
    clearScreenDown();
    if(prompt) output.write(prompt);
    if(opts.replace) {
      var str = '';
      for(var i=0; i<result.length; i++) {
        str += opts.replace;
      }
      output.write(str);
    } else if(!opts.silent) {
      output.write(result);
    }
  };

  input.setRawMode(true);
  input.setEncoding('utf8');
  input.on('data', processChar);
};

module.exports = ttyread;
