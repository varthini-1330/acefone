import WebSocket from 'ws';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export default async function connectToVapi(callbacks) {
  const res = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: process.env.VAPI_ASSISTANT_ID,
      transport: {
        provider: 'vapi.websocket',
        audioFormat: {
          format: 'pcm_s16le',
          container: 'raw',
          sampleRate: 16000
        }
      }
    })
  });

  const json = await res.json();
  const wsUrl = json.transport.websocketCallUrl;
  const vapiSocket = new WebSocket(wsUrl);

  vapiSocket.on('open', () => {
    console.log('🔗 Connected to Vapi WebSocket');
    if (callbacks.onOpen) callbacks.onOpen(vapiSocket);
  });

  vapiSocket.on('message', (data) => {
    if (callbacks.onMessage) callbacks.onMessage(data);
  });

  vapiSocket.on('close', () => console.log('❌ Vapi socket closed'));
  vapiSocket.on('error', (err) => console.error('Vapi error:', err));
}
