import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, Users } from 'lucide-react';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface VoiceChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  user_id?: string;
}

export const VoiceChat = ({ open, onOpenChange }: VoiceChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionStartedRef = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const createOrJoinConversation = async () => {
    // Create or get the default conversation room
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('name', 'Voice Chat Room')
      .single();

    if (existingConversation) {
      return existingConversation.id;
    }

    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert([{ name: 'Voice Chat Room', created_by: user?.id }])
      .select()
      .single();

    if (error) throw error;
    return newConversation.id;
  };

  const subscribeToConversation = (convId: string) => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`conversation:${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          console.log('New message:', payload.new);
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setActiveUsers(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!conversationId) return;

    const { error } = await supabase
      .from('conversation_messages')
      .insert([
        {
          conversation_id: conversationId,
          user_id: user?.id,
          role,
          content,
          message_type: 'audio_transcript',
        },
      ]);

    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const startConversation = async () => {
    try {
      // Create or join conversation
      const convId = await createOrJoinConversation();
      setConversationId(convId);

      // Load existing messages
      const { data: existingMessages } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (existingMessages) {
        setMessages(existingMessages as Message[]);
      }

      // Subscribe to realtime updates
      subscribeToConversation(convId);

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Connect to WebSocket (no authentication required)
      const wsUrl = `wss://ooqshqbvcujsysevvklx.supabase.co/functions/v1/realtime-chat`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Voice chat is ready",
        });
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type);

        if (data.type === 'session.created') {
          console.log('Session created, sending configuration...');
          sessionStartedRef.current = true;
          
          // Send session update with configuration
          ws.send(JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: 'You are a helpful AI assistant. Keep your responses conversational and natural.',
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 'inf'
            }
          }));

          // Start recording after session is configured
          recorderRef.current = new AudioRecorder((audioData) => {
            if (ws.readyState === WebSocket.OPEN && sessionStartedRef.current) {
              const encoded = encodeAudioForAPI(audioData);
              ws.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: encoded
              }));
            }
          });
          await recorderRef.current.start();
        }

        if (data.type === 'session.updated') {
          console.log('Session configured successfully');
        }

        if (data.type === 'response.audio.delta' && audioContextRef.current) {
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await playAudioData(audioContextRef.current, bytes);
          setIsSpeaking(true);
        }

        if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        }

        if (data.type === 'response.audio_transcript.delta') {
          // Accumulate AI response and save when complete
          const fullResponse = data.delta;
          if (fullResponse && fullResponse.trim()) {
            await saveMessage('assistant', fullResponse);
          }
        }

        if (data.type === 'conversation.item.input_audio_transcription.completed') {
          // Save user's speech to database
          if (data.transcript && data.transcript.trim()) {
            await saveMessage('user', data.transcript);
          }
        }

        if (data.type === 'error') {
          console.error('OpenAI error:', data);
          toast({
            title: "Error",
            description: data.error?.message || "An error occurred",
            variant: "destructive",
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice chat",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        sessionStartedRef.current = false;
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    clearAudioQueue();
    setIsConnected(false);
    setIsSpeaking(false);
    setMessages([]);
    setActiveUsers(0);
    sessionStartedRef.current = false;
  };

  useEffect(() => {
    if (!open) {
      endConversation();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      endConversation();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Voice Chat Room</span>
            {isConnected && (
              <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{activeUsers} active</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isSpeaking 
                ? 'bg-ai-blue animate-pulse' 
                : isConnected 
                  ? 'bg-primary' 
                  : 'bg-muted'
            }`}>
              {isConnected ? (
                <Mic className="w-16 h-16 text-white" />
              ) : (
                <MicOff className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold">
              {isConnected 
                ? isSpeaking 
                  ? 'AI is speaking...' 
                  : 'Listening...'
                : 'Not connected'}
            </p>
          </div>

          <div className="w-full max-h-64 overflow-y-auto space-y-3 px-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${
                  msg.role === 'assistant'
                    ? 'bg-primary/10 text-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-xs font-semibold mb-1">
                  {msg.role === 'assistant' ? 'AI' : 'User'}
                </p>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            {!isConnected ? (
              <Button 
                onClick={startConversation}
                className="bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Voice Chat
              </Button>
            ) : (
              <Button 
                onClick={endConversation}
                variant="destructive"
                size="lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                End Call
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
