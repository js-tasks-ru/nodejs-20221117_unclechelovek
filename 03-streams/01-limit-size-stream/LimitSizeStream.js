const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.counter = 0;
  }

  _transform(chunk, encoding, callback) {
    this.counter += chunk.length;
    if (this.counter > this.limit) {
      return callback(new LimitExceededError);
    }
    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;