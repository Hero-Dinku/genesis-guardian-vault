import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Message size validation
const MAX_MESSAGE_SIZE = 10 * 1024; // 10KB max message size

function validateMessageSize(message: string): boolean {
  const size = new TextEncoder().encode(message).length;
  return size <= MAX_MESSAGE_SIZE;
}

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  // Optional authentication (function is public); log when missing
  const authHeader = headers.get('authorization');
  if (!authHeader) {
    console.warn('Public access: Missing authorization header');
  }

  if (!OPENAI_API_KEY) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  console.log('Authenticated WebSocket connection established');

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;

  socket.onopen = () => {
    // Connect to OpenAI Realtime API
    // Note: Deno WebSocket doesn't support custom headers, so we pass auth as a protocol
      // Deno WebSocket protocols must be RFC6455 tokens - '=' is invalid.
      // Drop 'openai-beta.realtime=v1' from subprotocols to avoid SyntaxError: Invalid protocol value.
      openAISocket = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
        ["realtime", `openai-insecure-api-key.${OPENAI_API_KEY}`]
      );

    openAISocket.onmessage = (event) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: "OpenAI connection error" 
      }));
    };

    openAISocket.onclose = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  };

  socket.onmessage = (event) => {
    const message = event.data;
    
    // Validate message size
    if (!validateMessageSize(message)) {
      socket.send(JSON.stringify({ 
        type: "error", 
        message: "Message too large. Maximum size is 10KB" 
      }));
      return;
    }
    
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(message);
    }
  };

  socket.onclose = () => {
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  return response;
});
