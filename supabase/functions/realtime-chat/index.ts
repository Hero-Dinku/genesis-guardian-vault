import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  if (!OPENAI_API_KEY) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  // Get auth token from Sec-WebSocket-Protocol header (sent as subprotocol)
  const protocols = headers.get('sec-websocket-protocol') || '';
  const tokenMatch = protocols.split(',').find(p => p.trim().startsWith('websocket.'));
  const token = tokenMatch ? protocols.split(',').find(p => p.trim() !== 'websocket')?.trim() : null;

  if (!token) {
    return new Response("Missing authentication token", { status: 401 });
  }

  // Verify authentication
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('Authentication failed:', error);
    return new Response("Unauthorized", { status: 401 });
  }

  console.log('Authenticated user:', user.id);

  const { socket, response } = Deno.upgradeWebSocket(req, {
    protocol: 'websocket'
  });
  
  let openAISocket: WebSocket | null = null;

  socket.onopen = () => {
    console.log("Client connected");
    
    // Connect to OpenAI Realtime API
    openAISocket = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI");
    };

    openAISocket.onmessage = (event) => {
      const message = event.data;
      console.log("OpenAI message:", message);
      
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
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
      console.log("OpenAI connection closed");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  };

  socket.onmessage = (event) => {
    const message = event.data;
    console.log("Client message received");
    
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(message);
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
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
