const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);
  
  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end();
  };
  
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      const limitedStream = new LimitSizeStream({limit: 1048576, encoding: 'utf-8'});
      const wrstream = fs.createWriteStream(filepath);
      fs.stat(filepath, (error, stats) => {
        if (!error) {
          res.statusCode = 409;
          res.end();
        }
      });
      
      req.pipe(limitedStream).pipe(wrstream);

      wrstream.on('end', () => {
        res.end();
      });

      req.on('aborted', () => {
        fs.unlink(filepath, (err) => {
          if (err) {
            console.log(err.message);
          } else {
            console.log('файл удален');
          }
        });
      });

      limitedStream.on('error', (err) => {
        if (err instanceof LimitExceededError) {
          res.statusCode = 413;
          res.end();
        } else {
          res.statusCode = 500;
          res.end();
        }
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
