import http from 'http';

export function stringifyHeaders(r: http.IncomingMessage): string {
  return r.rawHeaders.join('\n');
}
