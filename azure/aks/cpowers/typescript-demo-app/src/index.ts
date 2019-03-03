// tslint:disable:no-console
import http from 'http';
import { stringifyHeaders } from './lib/headers';

process.on('SIGINT', () => process.exit());

http
  .createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end(stringifyHeaders(request));
  })
  .listen(80);

// Console will print the message
console.log('Server running at http://127.0.0.1:80/');
