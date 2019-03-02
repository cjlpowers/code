import http from 'http';
import net from 'net';
import { it } from 'mocha';
import assert from 'assert';
import { stringifyHeaders } from './headers';

it('stringifyHeaders', () => {
  const message = new http.IncomingMessage(new net.Socket());
  message.rawHeaders = ['header1', 'header2'];
  assert.equal(stringifyHeaders(message), 'header1\nheader2');
});
