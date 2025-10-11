import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Rate limiting configuration
const MAX_MESSAGE_SIZE = 10 * 1024; // 10KB max message size
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_MESSAGES_PER_WINDOW = 10; // 10 messages per minute

// Simple in-memory rate limiter (use Redis for production)
const userMessageCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = userMessageCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    userMessageCounts.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= MAX_MESSAGES_PER_WINDOW) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

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
    console.error('Authentication failed');
    return new Response("Unauthorized", { status: 401 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req, {
    protocol: 'websocket'
  });
  
  let openAISocket: WebSocket | null = null;

  socket.onopen = () => {
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
    
    // Check rate limit
    if (!checkRateLimit(user.id)) {
      socket.send(JSON.stringify({ 
        type: "error", 
        message: "Rate limit exceeded. Please wait before sending more messages" 
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
