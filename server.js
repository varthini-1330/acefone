import { config } from 'dotenv';
import { WebSocketServer } from 'ws';
import connectToVapi from './vapiClient.js';
import { decodeBase64Mulaw, encodeMulawToBase64 } from './utils/audio.js';

config();
const wss = new WebSocketServer({ port: process.env.PORT });

wss.on('connection', (ws) => {
  console.log('📞 Acefone connected');
  let vapiSocket;

  connectToVapi({
    onOpen: (vapi) => {
      vapiSocket = vapi;
    },
    onMessage: (data) => {
      const audioChunk = encodeMulawToBase64(data);
      ws.send(JSON.stringify({
        event: 'media',
        sequence_number: 1,
        stream_sid: '123',
        media: {
          chunk: 1,
          timestamp: Date.now(),
          payload: audioChunk
        }
      }));
    }
  });

  ws.on('message', (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.event === 'media') {
      const mulawBuffer = decodeBase64Mulaw(parsed.media.payload);
      if (vapiSocket && vapiSocket.readyState === 1) {
        vapiSocket.send(mulawBuffer);
      }
    } else {
      console.log('📩 Received event:', parsed.event);
    }
  });

  ws.on('close', () => {
    console.log('❌ Acefone disconnected');
    if (vapiSocket) vapiSocket.close();
  });
});

console.log(`🚀 WebSocket server running on ws://0.0.0.0:${process.env.PORT}`);
