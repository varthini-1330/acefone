import { fromByteArray, toByteArray } from 'base64-js';

export function decodeBase64Mulaw(payload) {
  return Buffer.from(payload, 'base64');
}

export function encodeMulawToBase64(buffer) {
  return buffer.toString('base64');
}
